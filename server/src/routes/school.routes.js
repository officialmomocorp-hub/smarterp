const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/school.controller');
const { authorize } = require('../middleware/auth');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize('SUPER_ADMIN'), schoolController.createSchool);
router.get('/', authorize('SUPER_ADMIN'), schoolController.getSchools);
router.put('/:id/reset-password', authorize('SUPER_ADMIN'), schoolController.resetAdminPassword);

module.exports = router;
