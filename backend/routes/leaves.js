const express = require('express');
const router = express.Router();
const Leave = require('../models/leaves');
const { isUserAuthenticated } = require('../middlewares/auth.middleware');

router.post('/', isUserAuthenticated, async (req, res) => {
  
  try {
    const user = req.user; // assuming authentication middleware added user to req
    const { reason, fromDate, toDate, subject, coursecode } = req.body;

    const newLeave = new Leave({
      name: user.name,
      userId: user._id,
      reason,
      fromDate,
      toDate,
      subject,
      coursecode,
      teacher: user._id,
      status: 'Pending',
    });

    await newLeave.save();
    res.status(201).json({ message: 'Leave request submitted successfully', leave: newLeave });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while submitting leave request' });
  }
});


// GET /api/leaves
router.get('/', async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error('Error fetching leaves:', err);
    res.status(500).json({ 
      error: 'Failed to fetch leave requests',
      details: err.message
    });
  }
});

// PATCH /api/leaves/:id
router.patch('/:id', async (req, res) => {
  try {
    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        adminComment: req.body.adminComment || ''
      },
      { new: true }
    );
    res.json(updatedLeave);
  } catch (err) {
    console.error('Error updating leave:', err);
    res.status(500).json({ 
      error: 'Failed to update leave request',
      details: err.message
    });
  }
});


module.exports = router;