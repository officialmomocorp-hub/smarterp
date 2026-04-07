const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: System healthy check
 *     tags: [Monitoring]
 */
router.get('/', healthController.checkHealth);

module.exports = router;
