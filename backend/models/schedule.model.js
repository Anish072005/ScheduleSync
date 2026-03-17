
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  day: {
    type: String,
    required: true,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  lecture: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
semester: {
  type: Number,
  required: false,  // ← change from true to false
  min: 1,
  max: 8,
},
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  venue: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  versionKey: false,
  timestamps: false,
});

const ScheduleModel = mongoose.model('Schedule', scheduleSchema);

module.exports = ScheduleModel;
