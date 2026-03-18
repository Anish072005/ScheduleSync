import React, { useState, useEffect } from 'react';
import Navbar from '../../Shared/Navbar';
import ScheduleCard from './ScheduleCard';
import AdjustmentProposalCard from './AdjustmentProposalCard';
import UpcomingAdjustmentCard from './UpcomingAdjustmentCard';
import useApi from '../../hooks/useApi';
import axios from 'axios';

const Dashboard = () => {
  const { get } = useApi();
  const [todaySchedules, setTodaySchedules]         = useState([]);
  const [upcomingAdjustments, setUpcomingAdjustments] = useState([]);
  const [adjustmentProposals, setAdjustmentProposals] = useState([]);
  const [lecturesDone, setLecturesDone]             = useState(0);
  const [lecturesLeft, setLecturesLeft]             = useState(0);
  const [doneLectureIds, setDoneLectureIds]         = useState([]);
const [doneAdjustmentIds, setDoneAdjustmentIds] = useState([]);
  // Load localStorage on mount
  useEffect(() => {
    const storedDone = JSON.parse(localStorage.getItem('doneLectureIds')) || [];
    setDoneLectureIds(storedDone);
    setLecturesDone(storedDone.length);

      const storedDoneAdj = JSON.parse(localStorage.getItem('doneAdjustmentIds')) || [];
  setDoneAdjustmentIds(storedDoneAdj);
  }, []);

  // Fetch schedules when doneLectureIds changes
  useEffect(() => {
    fetchSchedules();
  }, [doneLectureIds]);

  // Fetch adjustments once on mount
  useEffect(() => {
    fetchMyAdjustments();
  }, []);

  const fetchSchedules = async () => {
    try {
      const schedules = await get('/schedules');
      const weekday = new Date().toLocaleString('en-US', { weekday: 'short' });
      const filtered = schedules
        .filter(s => s.day === weekday && !doneLectureIds.includes(s._id))
        .map(s => ({
          id:        s._id,
          title:     s.teacher?.name || 'Unknown',
          startTime: s.startTime,
          endTime:   s.endTime,
          venue:     `${s.venue} (${s.subject})`,
          semester:  s.semester,
        }));
      setTodaySchedules(filtered);
      setLecturesLeft(filtered.length);
      localStorage.setItem('todayLectureCount', filtered.length);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

 const fetchMyAdjustments = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:3939/api/adjustments/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const all = res.data.adjustments || [];
    const storedDoneAdj = JSON.parse(localStorage.getItem('doneAdjustmentIds')) || [];

    setAdjustmentProposals(all.filter(a => a.status === 'Pending'));

    // ── Exclude already-done adjustments ──
    setUpcomingAdjustments(
      all.filter(a => a.status === 'Accepted' && !storedDoneAdj.includes(a._id))
    );
  } catch (error) {
    console.error("Error fetching adjustments:", error);
  }
};

const handleUpcomingDone = (adjustmentId) => {
  // Save to doneAdjustmentIds localStorage
  const updatedDoneAdj = [...doneAdjustmentIds, adjustmentId];
  setDoneAdjustmentIds(updatedDoneAdj);
  localStorage.setItem('doneAdjustmentIds', JSON.stringify(updatedDoneAdj));

  // Update counters — same as handleDone
  const updatedDone = [...doneLectureIds, adjustmentId];
  setDoneLectureIds(updatedDone);
  setLecturesDone(updatedDone.length);
  setLecturesLeft(prev => prev - 1);

  // Remove from upcoming list
  setUpcomingAdjustments(prev => prev.filter(a => a._id !== adjustmentId));

  // Save to doneLectureIds too so total count persists
  localStorage.setItem('doneLectureIds', JSON.stringify(updatedDone));
};


  const handleDone = (id) => {
    const updatedDone = [...doneLectureIds, id];
    setDoneLectureIds(updatedDone);
    setLecturesDone(updatedDone.length);
    setLecturesLeft(prev => prev - 1);
    setTodaySchedules(prev => prev.filter(s => s.id !== id));
    localStorage.setItem('doneLectureIds', JSON.stringify(updatedDone));
  };

  // Called when teacher accepts — move from proposals → upcoming
  // Replace this function in Dashboard.jsx
const handleAccepted = (adjustment) => {
  // Update status in proposals list — don't remove it
  setAdjustmentProposals(prev =>
    prev.map(a => a._id === adjustment._id ? { ...a, status: 'Accepted' } : a)
  );
  // Also add to upcoming
  setUpcomingAdjustments(prev => [
    { ...adjustment, status: 'Accepted' },
    ...prev
  ]);
};

  // Called when teacher rejects — remove from proposals
  const handleRejected = (adjustmentId) => {
    setAdjustmentProposals(prev => prev.filter(a => a._id !== adjustmentId));
  };

  return (
    <div className='relative flex flex-col h-full overflow-x-hidden overflow-y-auto'>
      <Navbar />
      <main className="flex-1 bg-white min-w-[1148px] max-h-[943px]">

        {/* ── Top Cards ── */}
        <div className="flex justify-between gap-2 p-4">
          <InfoCard icon="/assets/calendar.svg"         label="Total Lectures" value={lecturesDone + lecturesLeft} color="#006FD5" bg="bg-blue-300" />
          <InfoCard icon="/assets/mdi-light--clock.svg" label="Lectures Left"  value={lecturesLeft}               color="#372980" bg="bg-purple-300" />
          <InfoCard icon="/assets/copy-success.svg"     label="Lectures Done"  value={lecturesDone}               color="#03781D" bg="bg-green-300" />
        </div>

        {/* ── Upcoming Adjustments ── */}
 <Section title="Upcoming Adjustment's">
  {upcomingAdjustments.length === 0 ? (
    <EmptyMsg text="No upcoming adjustments." />
  ) : (
    upcomingAdjustments.map(adj => (
      <div key={adj._id} className="relative flex-shrink-0">
        <UpcomingAdjustmentCard adjustment={adj} />
        <button
          onClick={() => handleUpcomingDone(adj._id)}
          className="absolute bottom-3 left-4 right-4 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ✓ Done
        </button>
      </div>
    ))
  )}
</Section>

        {/* ── Today's Schedules ── */}
        <Section title="Today's Schedules">
          {todaySchedules.length === 0 ? (
            <EmptyMsg text="No schedules for today." />
          ) : (
            todaySchedules.map(schedule => (
              <div key={schedule.id} className="relative flex-shrink-0">
                <ScheduleCard {...schedule} />
                <button
                  onClick={() => handleDone(schedule.id)}
                  className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm"
                >
                  Done
                </button>
              </div>
            ))
          )}
        </Section>

        {/* ── Adjustment Proposals ── */}
        <Section title="Adjustment Proposals">
          {adjustmentProposals.length === 0 ? (
            <EmptyMsg text="No pending adjustment requests." />
          ) : (
            adjustmentProposals.map(adj => (
              <AdjustmentProposalCard
                key={adj._id}
                adjustment={adj}
                onAccepted={handleAccepted}
                onRejected={handleRejected}
              />
            ))
          )}
        </Section>

      </main>
    </div>
  );
};

// ── Shared UI ──
const InfoCard = ({ icon, label, value, color, bg }) => (
  <div className="flex flex-1 items-center border rounded-lg p-4 bg-white min-w-[352px] max-h-[108px]">
    <img src={icon} alt="" className={`${bg} text-white p-3 rounded-full`} />
    <div className="ml-4">
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      <br />
      <span className="text-sm" style={{ color }}>{label}</span>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <>
    <div className="flex p-4">
      <h1 id="font" className="text-3xl font-semibold">{title}</h1>
    </div>
    <div className="flex gap-2 pl-4 min-h-44 overflow-x-scroll scrollbar-hide scroll-smooth max-w-[83vw]">
      {children}
    </div>
  </>
);

const EmptyMsg = ({ text }) => (
  <div className="flex items-center text-gray-400 text-sm italic">
    {text}
  </div>
);

export default Dashboard;