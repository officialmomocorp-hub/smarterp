const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');

router.use(authenticate, schoolScoped);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

router.get('/', auditController.getLogs);
router.get('/:id', auditController.getLogById);

module.exports = router;
