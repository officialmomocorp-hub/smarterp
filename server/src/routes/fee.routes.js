const express = require('express');
const router = express.Router();
const feeController = require('../controllers/fee.controller');
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');

router.use(authenticate, schoolScoped);

router.post('/structure', authorize('SUPER_ADMIN', 'ADMIN'), feeController.createFeeStructure);
router.get('/structure', feeController.getFeeStructure);
router.post('/concession', authorize('SUPER_ADMIN', 'ADMIN'), feeController.createConcession);
router.post('/payment', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), feeController.processPayment);
router.get('/student/:studentId', feeController.getStudentFeeStatus);
router.get('/defaulters', authorize('SUPER_ADMIN', 'ADMIN'), feeController.getDefaulterList);
router.get('/collection-report', authorize('SUPER_ADMIN', 'ADMIN'), feeController.getCollectionReport);
router.post('/razorpay/order', feeController.createRazorpayOrder);
router.post('/razorpay/verify', feeController.verifyRazorpayPayment);

module.exports = router;
