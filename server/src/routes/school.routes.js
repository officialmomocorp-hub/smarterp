const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/school.controller');
const { authorize, authenticate, schoolScoped } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.post('/', authorize('SUPER_ADMIN'), schoolController.createSchool);
router.get('/', authorize('SUPER_ADMIN'), schoolController.getSchools);
router.put('/:id/reset-password', authorize('SUPER_ADMIN'), schoolController.resetAdminPassword);

// School Specific Settings (Admin only)
router.get('/settings', schoolScoped, schoolController.getSchoolSettings);
router.put('/settings', schoolScoped, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'letterhead', maxCount: 1 }]), schoolController.updateSchoolSettings);

module.exports = router;
