import { useNavigate } from 'react-router-dom';

const LeaveCard = ({ leave }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border rounded-lg p-4 min-w-[367px] max-h-fit flex-shrink-0">
      <div className="flex items-center">
        <span className="text-green-600 text-xl">●</span>
        <h2 className="text-lg ml-2">{leave.name}</h2>
      </div>
      <p className="text-gray-600 mt-1 flex items-center text-sm">
        Leave from: {new Date(leave.fromDate).toLocaleDateString()} –{' '}
        {new Date(leave.toDate).toLocaleDateString()}
      </p>
      <p className="text-gray-600 text-sm">Reason: {leave.reason}</p>
      <p className="text-gray-600 text-sm">
        Subject: {leave.subject} ({leave.coursecode})
      </p>
      <hr className="w-auto mt-2 h-px bg-gray-200 border-0" />
      <div className="mt-2">
        <button
          onClick={() => navigate("/admin/add-adjustment", { state: { leave } })}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 w-60 rounded-md text-sm transition-colors"
        >
          + Add Adjustment
        </button>
      </div>
    </div>
  );
};

export default LeaveCard;