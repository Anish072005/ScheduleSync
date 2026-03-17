const UpcomingAdjustmentCard = ({ adjustment }) => (
  <div className="bg-white border rounded-lg p-4 min-w-[367px] max-h-fit flex-shrink-0 pb-14">

    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-blue-500 text-xl">●</span>
        <h2 className="text-lg ml-2">Period {adjustment.lecture} · {adjustment.subject}</h2>
      </div>
      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700 border border-green-200">
        Accepted
      </span>
    </div>

    {/* Time */}
    <p className="text-gray-600 my-2 flex items-center">
      <img src="/assets/clock.svg" alt="Clock" className="mr-2" />
      {adjustment.startTime} → {adjustment.endTime}
    </p>

    {/* Venue */}
    <p className="text-gray-600 flex items-center">
      <img src="/assets/location.svg" alt="Location" className="mr-2" />
      {adjustment.venue}
    </p>

    {/* Date */}
{/* Date — add timeZone: 'Asia/Kolkata' */}
<p className="text-gray-500 text-sm mt-2 flex items-center gap-1.5">
  <img src="/assets/solarcalendar.svg" alt="Date" className="w-4 h-4" />
  {new Date(adjustment.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  })}
</p>

    {/* Covering for */}
    <p className="text-gray-500 text-sm mt-1">
      Covering for: <span className="text-gray-800 font-medium">{adjustment.absentTeacher}</span>
    </p>

  </div>
);

export default UpcomingAdjustmentCard;