const ScheduleModel = require('../models/schedule.model');
const UserModel = require('../models/user.model');
const LeaveModel = require('../models/leaves');

async function getSchedules(req, res) {
  try {
    const userId = req.user?.id;
    const { teacherId } = req.query;

    const query = { teacher: teacherId || userId };

    const schedules = await ScheduleModel.find(query)
      .populate('teacher', 'name')
      .sort({ day: 1, lecture: 1 })
      .lean();

    res.status(200).json(schedules);

  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function addSchedule(req, res) {
  try {
    const userId = req.user?.id || "68036c7fd327b2386b1d11e0";
    const { day, lecture, startTime, endTime, subject, venue, semester } = req.body;

    // ── Unique key without semester — one slot per teacher per day per period ──
    const scheduleId = `${userId}-${day}-${lecture}`;

    const existingSchedule = await ScheduleModel.findOne({ id: scheduleId });
    if (existingSchedule) {
      // Update all fields
      existingSchedule.startTime = startTime;
      existingSchedule.endTime   = endTime;
      existingSchedule.subject   = subject;
      existingSchedule.venue     = venue;
      if (semester) existingSchedule.semester = parseInt(semester);

      const updated = await existingSchedule.save();
      return res.status(200).json({ message: 'Schedule updated successfully', schedule: updated });
    }

    const newSchedule = new ScheduleModel({
      id:        scheduleId,
      teacher:   userId,
      day,
      lecture,
      startTime,
      endTime,
      subject,
      venue,
      semester:  semester ? parseInt(semester) : 1,
    });

    const saved = await newSchedule.save();
    res.status(201).json({ message: 'Schedule added successfully', schedule: saved });

  } catch (error) {
    console.error('Error adding new schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getFreeTeachers(req, res) {
  try {
    const { leaveId } = req.params;

    // STEP 1: Get the approved leave
    const leave = await LeaveModel.findById(leaveId);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'Approved') return res.status(400).json({ message: 'Leave is not approved yet' });

    // STEP 2: Get absent teacher
    const absentTeacher = await UserModel.findById(leave.teacher);
    if (!absentTeacher) {
      return res.status(404).json({ message: `No user found with ID: ${leave.teacher}` });
    }

    // STEP 3: Get ALL dates between fromDate and toDate (skip Sundays)
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

 // Replace getAllLeaveDates function:
const getAllLeaveDates = (fromDate, toDate) => {
  const dates = [];
  const start = new Date(fromDate);
  const end   = new Date(toDate);

  // ── Use local date not UTC ──
  const startLocal = new Date(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  );
  const endLocal = new Date(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate()
  );

  for (let d = new Date(startLocal); d <= endLocal; d.setDate(d.getDate() + 1)) {
    const dayName = dayMap[d.getDay()];
    if (dayName !== 'Sun') {
      dates.push({
        date:  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
        day:   dayName,
        label: d.toLocaleDateString('en-GB', {
          weekday: 'short', day: 'numeric',
          month: 'short', year: 'numeric'
        }),
      });
    }
  }
  return dates;
};

    const leaveDates = getAllLeaveDates(leave.fromDate, leave.toDate);

    if (leaveDates.length === 0) {
      return res.status(200).json({
        message: 'No working days found in leave period',
        freeTeachers: [],
        lecturesNeedingCoverage: []
      });
    }

    // STEP 4: Get all unique days in leave period e.g. ['Mon', 'Tue']
    const uniqueDays = [...new Set(leaveDates.map(d => d.day))];

    // STEP 5: Get absent teacher's slots for all those days
    const absentTeacherSlots = await ScheduleModel.find({
      teacher: absentTeacher._id,
      day: { $in: uniqueDays }
    }).lean();

    if (absentTeacherSlots.length === 0) {
      return res.status(200).json({
        message: `${leave.name} has no lectures during leave period`,
        freeTeachers: [],
        lecturesNeedingCoverage: []
      });
    }

    // STEP 6: Build one card per slot per matching date
    // e.g. Period 2 on Mon → one card for Mon 16 Mar, one card for Mon 17 Mar
    const lecturesNeedingCoverage = [];

    for (const slot of absentTeacherSlots) {
      const matchingDates = leaveDates.filter(d => d.day === slot.day);

      for (const dateInfo of matchingDates) {
        lecturesNeedingCoverage.push({
          lecture:   slot.lecture,
          day:       slot.day,
          date:      dateInfo.date,   // "2026-03-17" — used in handleSendAdjustment
          dateLabel: dateInfo.label,  // "Mon, 17 Mar 2026" — shown on card
          startTime: slot.startTime,
          endTime:   slot.endTime,
          subject:   slot.subject,
          venue:     slot.venue,
        });
      }
    }

    // Sort by date then by lecture number
    lecturesNeedingCoverage.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.lecture - b.lecture;
    });

    // STEP 7: Find all busy teacher IDs across all leave days
    const busyConditions = absentTeacherSlots.map(s => ({
      day: s.day,
      lecture: s.lecture
    }));

    const busySchedules = await ScheduleModel.find({
      $or: busyConditions
    }).select('teacher').lean();

    const busyTeacherIds = busySchedules.map(s => s.teacher.toString());

    // STEP 8: Find teachers who are free (not busy, not the absent teacher)
    const freeTeachers = await UserModel.find({
      _id: {
        $nin: busyTeacherIds,
        $ne: absentTeacher._id
      },
      role: 'user'
    }).select('name email').lean();

    res.status(200).json({
      leaveDay:               leaveDates.map(d => d.day).join(', '),
      leaveDates,
      absentTeacher:          leave.name,
      lecturesNeedingCoverage,
      freeTeachers
    });

  } catch (error) {
    console.error('Error finding free teachers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  getSchedules,
  addSchedule,
  getFreeTeachers
};