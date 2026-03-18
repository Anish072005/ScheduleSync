import React, { useEffect, useState } from "react";
import AdminNav from "./AdminNav";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import axios from "axios";
import AdjustmentCard from "./AdjustmentCard";
import LeaveCard from "./LeaveCard";

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

const Section = ({ title, children, isEmpty, emptyMsg }) => (
  <>
    <div className="flex p-4 pb-2">
      <h1 className="text-3xl font-semibold">{title}</h1>
    </div>
    <div className="flex gap-3 pl-4 min-h-44 overflow-x-auto scrollbar-hide scroll-smooth max-w-[83vw] pb-2">
      {isEmpty ? (
        <div className="flex items-center text-gray-400 text-sm italic">
          {emptyMsg}
        </div>
      ) : children}
    </div>
  </>
);

const Admindashboard = () => {
  const [onLeaveFaculty, setOnLeaveFaculty]                 = useState([]);
  const [todaySchedules, setTodaySchedules]                 = useState([]);
  const [allAdjustments, setAllAdjustments]                 = useState([]);
  const [totalScheduledTeachers, setTotalScheduledTeachers] = useState(0);
  const [totalAdjustmentsDone, setTotalAdjustmentsDone]     = useState(0);
  const [pendingCount, setPendingCount]                     = useState(0);

  const { get } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOnLeaveFaculty();
    fetchTodaySchedules();
    fetchAdjustments();

    // Auto-refresh every 30 seconds
    const fetchInterval = setInterval(() => {
      fetchAdjustments();
    }, 30000);

    return () => clearInterval(fetchInterval);
  }, []);

  const fetchOnLeaveFaculty = async () => {
    try {
      const res = await get("/leaves");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const filtered = res.filter((leave) =>
        new Date(leave.toDate) >= today && leave.status === "Approved"
      );
      setOnLeaveFaculty(filtered);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  const fetchTodaySchedules = async () => {
    try {
      const res = await get("/schedules");
      const weekday = new Date().toLocaleString("en-US", { weekday: "short" });
      const filtered = res
        .filter(s => s.day === weekday)
        .map(s => ({
          id:        s._id,
          title:     s.teacher?.name || 'Unknown',
          startTime: s.startTime,
          endTime:   s.endTime,
          venue:     `${s.venue} (${s.subject})`,
          semester:  s.semester ? `Semester ${s.semester}` : null,
        }));
      setTodaySchedules(filtered);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const fetchAdjustments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/adjustments/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const all = res.data.adjustments || [];
      setAllAdjustments(all);

      setTotalScheduledTeachers(all.length);
      setTotalAdjustmentsDone(all.filter(a => a.status === 'Accepted').length);
      setPendingCount(all.filter(a => a.status === 'Pending').length);
    } catch (err) {
      console.error("Error fetching adjustments:", err);
    }
  };

  // ── All pending ──
  const pendingAdjustments = allAdjustments.filter(
    a => a.status === 'Pending'
  );

  // ── All accepted — no date filter ──
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const acceptedAdjustments = allAdjustments.filter(a => {
  if (a.status !== 'Accepted') return false;
  
  // Show if lecture date is today or in the future
  const lectureDate = new Date(a.date);
  lectureDate.setHours(0, 0, 0, 0);
  return lectureDate >= todayStart;
});


  return (
    <div className="relative flex flex-col h-full overflow-x-hidden overflow-y-auto">
      <AdminNav />
      <main className="flex-1 bg-white min-w-[1148px]">

        {/* ── Top Cards ── */}
        <div className="flex justify-between gap-2 p-4 w-full">
          <InfoCard
            icon="/assets/calendar.svg"
            label="Total Scheduled Teachers"
            value={totalScheduledTeachers}
            color="#006FD5"
            bg="bg-blue-300"
          />
          <InfoCard
            icon="/assets/copy-success.svg"
            label="Adjustments Done"
            value={totalAdjustmentsDone}
            color="#03781D"
            bg="bg-green-300"
          />
          <InfoCard
            icon="/assets/mdi-light--clock.svg"
            label="Pending Adjustments"
            value={pendingCount}
            color="#372980"
            bg="bg-purple-300"
          />
        </div>

        {/* ── On Leave Faculty ── */}
        <div className="p-4 pb-0">
          <h1 className="text-3xl font-semibold mb-4">On Leave Faculty</h1>
          {onLeaveFaculty.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No faculty on leave today.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {onLeaveFaculty.map((leave) => (
                <LeaveCard key={leave._id} leave={leave} />
              ))}
            </div>
          )}
        </div>

        {/* ── Adjustment Proposals (ALL Pending) ── */}
        <Section
          title="Adjustment Proposals"
          isEmpty={pendingAdjustments.length === 0}
          emptyMsg="No pending adjustment requests."
        >
          {pendingAdjustments.map((adj) => (
            <AdjustmentCard
              key={adj._id}
              absentTeacher={adj.absentTeacher}
              substituteName={adj.substituteTeacher?.name || 'Unknown'}
              subject={adj.subject}
              venue={adj.venue}
              startTime={adj.startTime || '—'}
              endTime={adj.endTime || '—'}
              lectureNo={adj.lecture}
              status={adj.status}
              date={adj.date}
            />
          ))}
        </Section>

        {/* ── Scheduled Teachers (ALL Accepted) ── */}
        <Section
          title="Scheduled Teachers for Today"
          isEmpty={acceptedAdjustments.length === 0}
          emptyMsg="No accepted adjustments yet."
        >
          {acceptedAdjustments.map((adj) => (
            <div
              key={adj._id}
              className="bg-white border rounded-lg p-4 min-w-[367px] max-h-fit flex-shrink-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-green-500 text-xl">●</span>
                  <h2 className="text-lg ml-2">
                    {adj.substituteTeacher?.name || 'Unknown'}
                  </h2>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">
                  ✓ Confirmed
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1 mb-2">
                📅 {new Date(adj.date).toLocaleDateString('en-GB', {
                  weekday: 'short', day: 'numeric',
                  month: 'short', year: 'numeric'
                })}
              </p>
              <p className="text-gray-600 my-1 flex items-center text-sm">
                <img src="/assets/clock.svg" alt="Clock" className="mr-2 w-4 h-4" />
                {adj.startTime || '—'} → {adj.endTime || '—'}
              </p>
              <p className="text-gray-600 flex items-center text-sm">
                <img src="/assets/location.svg" alt="Location" className="mr-2 w-4 h-4" />
                {adj.venue} ({adj.subject})
              </p>
              <hr className="my-2 border-gray-100" />
              <p className="text-gray-500 text-sm">
                Period:{' '}
                <span className="text-gray-800 font-medium">{adj.lecture}</span>
              </p>
              <p className="text-gray-500 text-sm mt-0.5">
                Covering for:{' '}
                <span className="text-gray-800 font-medium">{adj.absentTeacher}</span>
              </p>
            </div>
          ))}
        </Section>

      </main>
    </div>
  );
};

export default Admindashboard;