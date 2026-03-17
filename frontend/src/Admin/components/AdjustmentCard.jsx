const AdjustmentCard = ({
  absentTeacher,
  substituteName,
  subject,
  venue,
  startTime,
  endTime,
  lectureNo,
  status,
  date
}) => {
  const statusStyles = {
    Pending:  'bg-yellow-100 text-yellow-700',
    Accepted: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white border rounded-lg p-4 min-w-[367px] max-h-fit">

      {/* Header — same green dot style as ScheduleCard */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-purple-500 text-xl">●</span>
          <h2 className="text-lg ml-2">Period {lectureNo} · {subject}</h2>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[status] || statusStyles.Pending}`}>
          {status}
        </span>
      </div>

      {/* Time — same as ScheduleCard */}
      <p className="text-gray-600 my-2 flex items-center">
        <img src="/assets/clock.svg" alt="Clock" className="mr-2" />
        {startTime} → {endTime}
      </p>

      {/* Venue — same as ScheduleCard */}
      <p className="text-gray-600 flex items-center">
        <img src="/assets/location.svg" alt="Location" className="mr-2" />
        {venue}
      </p>

      <hr className="my-2 border-gray-100" />

      {/* Absent + Substitute */}
      <p className="text-gray-500 text-sm">
        Absent: <span className="text-gray-800 font-medium">{absentTeacher}</span>
      </p>
      <p className="text-gray-500 text-sm mt-0.5">
        Substitute: <span className="text-purple-600 font-medium">{substituteName}</span>
      </p>
    </div>
  );
};

export default AdjustmentCard;