import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useApi from '../../hooks/useApi';

const AddAdjustment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { get } = useApi();
  const leave = location.state?.leave;

  const [freeTeachers, setFreeTeachers] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiUsed, setAiUsed] = useState(false);

  useEffect(() => {
    if (!leave) return;
    fetchFreeTeachers();
  }, [leave]);

  useEffect(() => {
    setAiSuggestions([]);
    setAiUsed(false);
    setAiError('');
    setSelectedTeacher(null);
  }, [selectedLecture]);

  const fetchFreeTeachers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await get(`/schedules/free-teachers/${leave._id}`);
      setFreeTeachers(data.freeTeachers || []);
      setLectures(data.lecturesNeedingCoverage || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch free teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleAiSuggest = async () => {
    if (!selectedLecture) return setAiError('Please select a lecture first');
    if (freeTeachers.length === 0) return setAiError('No free teachers available');

    setAiLoading(true);
    setAiError('');
    setAiSuggestions([]);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:3939/api/adjustments/ai-suggest',
        {
          absentTeacher: {
            name: leave.name,
            subject: leave.subject,
            coursecode: leave.coursecode,
          },
          selectedLecture,
          freeTeachers: freeTeachers.map(t => ({
            _id: t._id,
            name: t.name,
            email: t.email,
            subject: t.subject || '',
            adjustmentsThisWeek: t.adjustmentsThisWeek || 0,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAiSuggestions(res.data.suggestions || []);
      setAiUsed(true);

      if (res.data.suggestions?.length > 0) {
        const topId = res.data.suggestions[0].teacherId;
        const topTeacher = freeTeachers.find(t => t._id === topId);
        if (topTeacher) setSelectedTeacher(topTeacher);
      }
    } catch (err) {
      setAiError('AI suggestion failed. Please select manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendAdjustment = async () => {
    if (!selectedTeacher) return setError('Please select a teacher');
    if (!selectedLecture) return setError('Please select a lecture to cover');


    console.log('📦 Sending:', {
    leaveId: leave._id,
    substituteTeacherId: selectedTeacher._id,
    lecture: selectedLecture.lecture,
    day: selectedLecture.day,
    subject: selectedLecture.subject,
    venue: selectedLecture.venue,
    fromDate: selectedLecture.date,
    });
    setSending(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3939/api/adjustments/send', {
        leaveId:             leave._id,
        substituteTeacherId: selectedTeacher._id,
        lecture:             selectedLecture.lecture,
        day:                 selectedLecture.day,
        subject:             selectedLecture.subject,
        venue:               selectedLecture.venue,
        fromDate:            selectedLecture.date,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSuccess(`Adjustment request sent to ${selectedTeacher.name} successfully!`);
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send adjustment request');
    } finally {
      setSending(false);
    }
  };

  const getAiInfo = (teacherId) =>
    aiSuggestions.find(s => s.teacherId === teacherId?.toString());

  const sortedTeachers = aiSuggestions.length > 0
    ? [...freeTeachers].sort((a, b) => {
        const ra = aiSuggestions.findIndex(s => s.teacherId === a._id?.toString());
        const rb = aiSuggestions.findIndex(s => s.teacherId === b._id?.toString());
        return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
      })
    : freeTeachers;

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const avatarColors = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
  ];

  const getAvatarColor = (name) =>
    avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  // ── Group lectures by dateLabel ──
  const lecturesByDate = lectures.reduce((groups, lec) => {
    const key = lec.dateLabel || lec.day;
    if (!groups[key]) groups[key] = [];
    groups[key].push(lec);
    return groups;
  }, {});

  if (!leave) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-3">No leave data provided.</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 underline text-sm">← Go back</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add Adjustment</h2>
          <p className="text-sm text-gray-500 mt-0.5">Assign a substitute teacher for the absent teacher's classes</p>
        </div>
      </div>

      {/* ── Absent Teacher Card ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-start">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${getAvatarColor(leave.name)}`}>
              {getInitials(leave.name)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">{leave.name}</h3>
              <p className="text-gray-500 text-sm mt-0.5">{leave.subject} · {leave.coursecode}</p>
              <p className="text-gray-400 text-xs mt-1">
                {leave.reason} &nbsp;·&nbsp;{' '}
                {new Date(leave.fromDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                {' – '}
                {new Date(leave.toDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
            ✓ {leave.status}
          </span>
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
          <span className="mt-0.5">⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-start gap-2">
          <span className="mt-0.5">✅</span> {success}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-gray-500 py-12 justify-center">
          <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Loading available teachers...
        </div>
      ) : (
        <div className="space-y-8">

          {/* ══ STEP 1 — Select Lecture ══ */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
              <div>
                <h3 className="font-semibold text-gray-900">Select Lecture to Cover</h3>
                <p className="text-xs text-gray-400">Choose which period needs a substitute</p>
              </div>
            </div>

            {lectures.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                No lectures found for this leave period.
              </div>
            ) : (
              // ── Grouped by date ──
              <div className="space-y-6">
                {Object.entries(lecturesByDate).map(([dateLabel, lecs]) => (
                  <div key={dateLabel}>

                    {/* ── Date group header ── */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-100 rounded-full px-3 py-1 flex-shrink-0">
                        📅 {dateLabel}
                      </span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* ── Period cards for this date ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {lecs.map((lec, i) => {
                        const isSelected =
                          selectedLecture?.lecture === lec.lecture &&
                          selectedLecture?.date === lec.date;

                        return (
                          <div
                            key={i}
                            onClick={() => setSelectedLecture(lec)}
                            className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-150 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                            }`}
                          >
                            {/* Checkmark */}
                            {isSelected && (
                              <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                </svg>
                              </span>
                            )}

                            {/* Period header */}
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? 'bg-blue-500' : 'bg-blue-400'}`} />
                              <span className="font-semibold text-gray-800 text-sm">Period {lec.lecture}</span>
                            </div>

                            {/* Time */}
                            <p className="text-gray-600 my-1 flex items-center text-xs gap-1.5">
                              <img src="/assets/clock.svg" alt="Clock" className="w-3.5 h-3.5 flex-shrink-0" />
                              {lec.startTime} → {lec.endTime}
                            </p>

                            {/* Venue + Subject */}
                            <p className="text-gray-600 flex items-center text-xs gap-1.5">
                              <img src="/assets/location.svg" alt="Location" className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{lec.venue}</span>
                              <span className="text-gray-400 flex-shrink-0">({lec.subject})</span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══ STEP 2 — Select Teacher ══ */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Select Available Teacher</h3>
                  <p className="text-xs text-gray-400">
                    {aiUsed ? 'AI ranked by best fit — you can override' : 'Select manually or use AI to rank'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleAiSuggest}
                disabled={!selectedLecture || aiLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  !selectedLecture
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : aiUsed
                    ? 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100'
                    : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md'
                }`}
              >
                {aiLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <span>Thinking...</span>
                  </>
                ) : aiUsed ? (
                  <><span>✨</span><span>Re-suggest</span></>
                ) : (
                  <><span>🤖</span><span>AI Suggest</span></>
                )}
              </button>
            </div>

            {!selectedLecture && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex items-center gap-2">
                <span>💡</span> Select a lecture period above first to enable AI suggestions
              </div>
            )}

            {aiError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2">
                <span>⚠️</span> {aiError}
              </div>
            )}

            {aiUsed && aiSuggestions.length > 0 && (
              <div className="mb-4 p-3.5 bg-violet-50 border border-violet-200 rounded-xl flex items-start gap-3">
                <span className="text-violet-500 text-lg leading-none">✨</span>
                <div>
                  <p className="text-sm font-medium text-violet-800">AI has ranked the teachers</p>
                  <p className="text-xs text-violet-600 mt-0.5">Top pick auto-selected based on subject match and workload.</p>
                </div>
              </div>
            )}

            {freeTeachers.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                No free teachers available for this time slot.
              </div>
            ) : (
              <div className="space-y-2.5">
                {sortedTeachers.map((teacher) => {
                  const aiInfo = getAiInfo(teacher._id);
                  const isTopPick = aiSuggestions[0]?.teacherId === teacher._id?.toString();
                  const isSelected = selectedTeacher?._id === teacher._id;
                  const rank = aiSuggestions.findIndex(s => s.teacherId === teacher._id?.toString());

                  return (
                    <div
                      key={teacher._id}
                      onClick={() => setSelectedTeacher(teacher)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                          : isTopPick
                          ? 'border-violet-300 bg-violet-50/50 hover:border-violet-400'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${getAvatarColor(teacher.name)}`}>
                            {getInitials(teacher.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900 text-sm">{teacher.name}</span>
                              {isTopPick && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-violet-100 text-violet-700 font-medium border border-violet-200">
                                  ✨ Best match
                                </span>
                              )}
                              {aiInfo && !isTopPick && rank >= 0 && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500 font-medium">
                                  #{rank + 1}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{teacher.email}</p>
                            {aiInfo && (
                              <p className="text-xs text-violet-600 mt-1.5 flex items-start gap-1">
                                <span className="mt-0.5 flex-shrink-0">💡</span>
                                <span>{aiInfo.reason}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-full border-2 border-gray-200 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══ STEP 3 — Summary + Send ══ */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
              <div>
                <h3 className="font-semibold text-gray-900">Send Adjustment Request</h3>
                <p className="text-xs text-gray-400">Review and confirm before sending</p>
              </div>
            </div>

            {(selectedTeacher || selectedLecture) && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Summary</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 w-28 flex-shrink-0 text-xs">Absent teacher</span>
                    <span className="font-medium text-gray-800">{leave.name}</span>
                  </div>
                  {selectedLecture && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 w-28 flex-shrink-0 text-xs">Date</span>
                        <span className="font-medium text-gray-800">
                          {selectedLecture.dateLabel || selectedLecture.day}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 w-28 flex-shrink-0 text-xs">Period</span>
                        <span className="font-medium text-gray-800">
                          Period {selectedLecture.lecture}
                          <span className="text-gray-500 font-normal ml-1.5">
                            {selectedLecture.startTime} – {selectedLecture.endTime} · {selectedLecture.venue}
                          </span>
                        </span>
                      </div>
                    </>
                  )}
                  {selectedTeacher && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400 w-28 flex-shrink-0 text-xs">Substitute</span>
                      <span className="font-medium text-gray-800 flex items-center gap-2">
                        {selectedTeacher.name}
                        {aiUsed && aiSuggestions[0]?.teacherId === selectedTeacher._id?.toString() && (
                          <span className="text-xs text-violet-600 font-normal">✨ AI recommended</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedTeacher && !selectedLecture && (
              <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl mb-4">
                Complete steps 1 and 2 to see a summary
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleSendAdjustment}
                disabled={sending || !selectedTeacher || !selectedLecture}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  !selectedTeacher || !selectedLecture
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : sending
                    ? 'bg-green-400 text-white cursor-wait'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
                }`}
              >
                {sending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <><span>📨</span> Send Request</>
                )}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AddAdjustment;