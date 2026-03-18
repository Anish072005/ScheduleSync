const dotenv = require('dotenv');
dotenv.config(); // ← must be called before anything else

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const leaveRoutes = require('./routes/leaves');
const scheduleRoutes = require('./routes/schedule.routes');
const userRoutes = require('./routes/user.routes');
const adjustmentRoutes = require('./routes/AdjustmentRoutes');

const app = express();
const PORT = process.env.PORT || 3939; // ← add this

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://schedulesync-beta.vercel.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.use('/api/users', userRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/adjustments', adjustmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'ScheduleSync'
})
.then(() => {
  console.log('MongoDB connected successfully');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})
.catch(err => console.error('MongoDB connection error:', err));