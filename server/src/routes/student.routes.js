const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const studentValidation = require('../validations/student.validation');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.use(authenticate, schoolScoped);

router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), studentController.create);
router.post('/import', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), upload.single('file'), studentController.importStudents);
router.get('/', studentController.findAll);
router.get('/statistics', studentController.getStatistics);
router.get('/defaulters', studentController.getDefaulterList);
router.get('/:id', studentController.findById);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), validate(studentValidation.updateStudent), studentController.update);
router.put('/:id/reset-password', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), studentController.resetPassword);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), studentController.delete);

module.exports = router;
