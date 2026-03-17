const { Router } = require('express');
const adjustmentController = require('../controllers/adjustment.controller');
const { isUserAuthenticated, isAdminAuthenticated } = require('../middlewares/auth.middleware');

const router = Router();

// Admin — send adjustment request to a teacher
router.post('/send', isAdminAuthenticated, adjustmentController.sendAdjustment);

// 🤖 NEW — AI suggest best substitute teacher
router.post('/ai-suggest', isAdminAuthenticated, adjustmentController.aiSuggestTeacher);

// Admin — get all adjustments
router.get('/all', isAdminAuthenticated, adjustmentController.getAllAdjustments);

// Teacher — get their own adjustment requests
router.get('/my', isUserAuthenticated, adjustmentController.getMyAdjustments);

// Teacher — accept or reject an adjustment request
router.patch('/:id/status', isUserAuthenticated, adjustmentController.updateAdjustmentStatus);

module.exports = router;