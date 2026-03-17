const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema({
  leaveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Leave',
    required: true
  },
  absentTeacher: {
    type: String, // storing name since Leave uses name string
    required: true
  },
  substituteTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lecture: {
    type: Number,
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  },
  date: {
    type: Date,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

const AdjustmentModel = mongoose.model('Adjustment', adjustmentSchema);
module.exports = AdjustmentModel;