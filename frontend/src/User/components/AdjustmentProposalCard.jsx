import axios from 'axios';
import { useState } from 'react';

const AdjustmentProposalCard = ({ adjustment, onAccepted, onRejected }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use status from props so parent controls the visual state
  const isAccepted = adjustment.status === 'Accepted';
  const isRejected = adjustment.status === 'Rejected';
  const isPending  = adjustment.status === 'Pending';

  const statusStyles = {
    Pending:  'bg-yellow-100 text-yellow-700',
    Accepted: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  const handleAction = async (status) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3939/api/adjustments/${adjustment._id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (status === 'Accepted') onAccepted(adjustment);
      if (status === 'Rejected') onRejected(adjustment._id);
    } catch (err) {
      setError('Action failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white border rounded-lg p-4 min-w-[367px] max-h-fit flex-shrink-0 transition-all ${
      isAccepted ? 'border-green-300 bg-green-50' :
      isRejected ? 'border-red-200 bg-red-50 opacity-60' :
      'border-gray-200'
    }`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className={`text-xl ${
            isAccepted ? 'text-green-500' :
            isRejected ? 'text-red-400' :
            'text-purple-500'
          }`}>●</span>
          <h2 className="text-lg ml-2">Period {adjustment.lecture} · {adjustment.subject}</h2>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[adjustment.status]}`}>
          {adjustment.status}
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

      {/* Cover for */}
      <p className="text-gray-500 text-sm mt-2">
        Cover for: <span className="text-gray-800 font-medium">{adjustment.absentTeacher}</span>
      </p>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Buttons — only show when Pending */}
      {isPending && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handleAction('Accepted')}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? '...' : '✓ Accept'}
          </button>
          <button
            onClick={() => handleAction('Rejected')}
            disabled={loading}
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 text-sm py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? '...' : '✕ Reject'}
          </button>
        </div>
      )}

      {/* Accepted state */}
      {isAccepted && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-green-600 text-sm font-medium">
          <span>✓</span> You accepted this adjustment
        </div>
      )}

      {/* Rejected state */}
      {isRejected && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-red-400 text-sm">
          <span>✕</span> You rejected this adjustment
        </div>
      )}
    </div>
  );
};

export default AdjustmentProposalCard;