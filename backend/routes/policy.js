const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policy');

router.get('/list', policyController.getPolicyList);
router.post('/analyze', policyController.analyzePolicy);
router.post('/analyze-detailed', policyController.analyzeDetailedPolicy);
router.get('/:id', policyController.getPolicyDetail);
router.get('/report/:id', policyController.getPolicyReport);
router.post('/export-feishu', policyController.exportToFeishu);

module.exports = router; 