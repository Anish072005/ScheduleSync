const AdjustmentModel = require('../models/AdjustmentModel');
const UserModel = require('../models/user.model');
const LeaveModel = require('../models/leaves');
const ScheduleModel = require('../models/schedule.model');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env =require ('dotenv')
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function sendAdjustment(req, res) {
  try {
    const { leaveId, substituteTeacherId, lecture, day, subject, venue, fromDate } = req.body;

    // ── Fix: lecture=0 fails !lecture check ──
    if (!leaveId || !substituteTeacherId || lecture === undefined || lecture === null || !day || !subject || !venue || !fromDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const leave = await LeaveModel.findById(leaveId);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'Approved') return res.status(400).json({ message: 'Leave is not approved yet' });

    const substituteTeacher = await UserModel.findById(substituteTeacherId);
    if (!substituteTeacher) return res.status(404).json({ message: 'Substitute teacher not found' });


    
 // Replace the duplicate check in sendAdjustment:
const existing = await AdjustmentModel.findOne({
  leaveId,
  lecture,
  day,
  substituteTeacher: substituteTeacherId
});

if (existing && existing.status !== 'Rejected') {
  return res.status(400).json({ 
    message: existing.status === 'Accepted' 
      ? 'This teacher has already accepted this adjustment' 
      : 'Adjustment request already sent for this slot'
  });
}

    // Get startTime/endTime from schedule
    const schedule = await ScheduleModel.findOne({
      lecture, subject, venue
    }).lean();

    // ── Fix timezone: store as local noon to avoid UTC offset ──
    const [year, month, day2] = fromDate.split('-').map(Number);
    const localDate = new Date(year, month - 1, day2, 12, 0, 0);

    const adjustment = new AdjustmentModel({
      leaveId,
      absentTeacher:     leave.name,
      substituteTeacher: substituteTeacherId,
      lecture,
      day,
      date:      localDate,
      subject,
      venue,
      startTime: schedule?.startTime || null,
      endTime:   schedule?.endTime   || null,
      status:    'Pending'
    });

    const saved = await adjustment.save();
    res.status(201).json({ message: 'Adjustment request sent successfully', adjustment: saved });

  } catch (error) {
    console.error('Error sending adjustment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// ─────────────────────────────────────────────
// GET ADJUSTMENTS FOR LOGGED-IN TEACHER
// GET /api/adjustments/my
// ─────────────────────────────────────────────
async function getMyAdjustments(req, res) {
  try {
    const userId = req.user._id;

    const adjustments = await AdjustmentModel.find({ substituteTeacher: userId })
      .populate('leaveId', 'fromDate toDate reason')
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with startTime/endTime from schedules
    const enriched = await Promise.all(
      adjustments.map(async (adj) => {
        try {
          const schedule = await ScheduleModel.findOne({
            lecture: adj.lecture,
            subject: adj.subject,
            venue:   adj.venue,
          }).lean();
          return {
            ...adj,
            startTime: adj.startTime || schedule?.startTime || '—',
            endTime:   adj.endTime   || schedule?.endTime   || '—',
          };
        } catch {
          return { ...adj, startTime: '—', endTime: '—' };
        }
      })
    );

    res.status(200).json({ adjustments: enriched });

  } catch (error) {
    console.error('Error fetching adjustments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// ─────────────────────────────────────────────
// GET ALL ADJUSTMENTS (Admin)
// GET /api/adjustments/all
// ─────────────────────────────────────────────
async function getAllAdjustments(req, res) {
  try {
    const adjustments = await AdjustmentModel.find()
      .populate('substituteTeacher', 'name email')
      .populate('leaveId', 'fromDate toDate reason')
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with startTime/endTime from schedules
    const enriched = await Promise.all(
      adjustments.map(async (adj) => {
        try {
          const schedule = await ScheduleModel.findOne({
            lecture: adj.lecture,
            subject: adj.subject,
            venue:   adj.venue,
          }).lean();
          return {
            ...adj,
            startTime: adj.startTime || schedule?.startTime || '—',
            endTime:   adj.endTime   || schedule?.endTime   || '—',
          };
        } catch {
          return adj;
        }
      })
    );

    res.status(200).json({ adjustments: enriched });

  } catch (error) {
    console.error('Error fetching all adjustments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// ─────────────────────────────────────────────
// UPDATE ADJUSTMENT STATUS
// PATCH /api/adjustments/:id/status
// ─────────────────────────────────────────────
async function updateAdjustmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Accepted or Rejected' });
    }

    const adjustment = await AdjustmentModel.findById(id);
    if (!adjustment) return res.status(404).json({ message: 'Adjustment not found' });

    if (adjustment.substituteTeacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: Not your adjustment request' });
    }

    adjustment.status = status;
    const updated = await adjustment.save();
    res.status(200).json({
      message: `Adjustment ${status.toLowerCase()} successfully`,
      adjustment: updated
    });

  } catch (error) {
    console.error('Error updating adjustment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// ─────────────────────────────────────────────
// AI SUGGEST BEST SUBSTITUTE TEACHER
// POST /api/adjustments/ai-suggest
// ─────────────────────────────────────────────
async function aiSuggestTeacher(req, res) {
  try {
    const { absentTeacher, selectedLecture, freeTeachers } = req.body;

    if (!absentTeacher || !selectedLecture || !freeTeachers?.length) {
      return res.status(400).json({ message: 'Missing required data for AI suggestion' });
    }

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const teacherIds = freeTeachers.map(t => t._id);

    const adjustmentCounts = await AdjustmentModel.aggregate([
      {
        $match: {
          substituteTeacher: {
            $in: teacherIds.map(id => new mongoose.Types.ObjectId(id))
          },
          date:   { $gte: weekStart },
          status: { $in: ['Pending', 'Accepted'] }
        }
      },
      {
        $group: { _id: '$substituteTeacher', count: { $sum: 1 } }
      }
    ]);

    const teachersWithCounts = freeTeachers.map(t => ({
      ...t,
      adjustmentsThisWeek: adjustmentCounts.find(
        a => a._id.toString() === t._id.toString()
      )?.count || 0
    }));

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are a school timetable assistant. An admin needs to assign a substitute teacher.

Absent teacher: ${absentTeacher.name}
Subject to cover: ${absentTeacher.subject} (${absentTeacher.coursecode})
Period: ${selectedLecture.lecture} (${selectedLecture.startTime} - ${selectedLecture.endTime})
Venue: ${selectedLecture.venue}

Available free teachers (already confirmed free for this period):
${JSON.stringify(teachersWithCounts, null, 2)}

Rank ALL teachers from best to worst substitute choice.
Criteria (in order of priority):
1. Subject match with absent teacher's subject
2. Fewest adjustmentsThisWeek (less burdened)
3. Any other relevant factor

Give a short one-sentence reason for each teacher's rank.

Reply ONLY with this exact JSON format, no markdown, no extra text:
{
  "suggestions": [
    { "teacherId": "exact _id value", "name": "teacher name", "reason": "one sentence" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return res.status(500).json({ message: 'AI returned invalid response, try again' });
    }

    res.status(200).json(parsed);

  } catch (error) {
    console.error('AI suggest error:', error.message);
    res.status(500).json({ message: 'AI suggestion failed', error: error.message });
  }
}

module.exports = {
  sendAdjustment,
  getMyAdjustments,
  getAllAdjustments,
  updateAdjustmentStatus,
  aiSuggestTeacher
};