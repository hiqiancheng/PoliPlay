const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policy');

/**
 * @route   POST /api/policy/analyze
 * @desc    分析政策内容，获取主题总结和细化问题
 * @access  Public
 */
router.post('/analyze', policyController.analyzePolicy);

/**
 * @route   POST /api/policy/analyze-detailed
 * @desc    提交详细政策，获取分析报告
 * @access  Public
 */
router.post('/analyze-detailed', policyController.analyzeDetailedPolicy);

/**
 * @route   GET /api/policy/:id
 * @desc    获取政策详情
 * @access  Public
 */
router.get('/:id', policyController.getPolicyDetail);

/**
 * @route   GET /api/policy/report/:id
 * @desc    获取政策报告
 * @access  Public
 */
router.get('/report/:id', policyController.getPolicyReport);

/**
 * @route   POST /api/policy/export-to-feishu
 * @desc    导出政策报告到飞书
 * @access  Public
 */
router.post('/export-to-feishu', policyController.exportToFeishu);

module.exports = router; 