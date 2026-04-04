const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');

router.use(authenticate, schoolScoped);

router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), studentController.create);
router.get('/', studentController.findAll);
router.get('/statistics', studentController.getStatistics);
router.get('/defaulters', studentController.getDefaulterList);
router.get('/:id', studentController.findById);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), studentController.update);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), studentController.delete);

module.exports = router;
