const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const policyService = require('../services/policy');
const policyModel = require('../models/policy');

/**
 * 获取现有政策列表
 */
exports.getPolicyList = async (req, res) => {
  try {
    const list = await policyModel.getAllPolicies();
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ error: '获取政策列表失败' });
  }
};

/**
 * 分析政策内容，获取主题总结和细化问题
 */
exports.analyzePolicy = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }
    const analysisResult = await policyService.analyzePolicy(title, content);
    res.status(200).json(analysisResult);
  } catch (error) {
    console.error('政策分析失败:', error);
    res.status(500).json({ error: '政策分析失败，请重试' });
  }
};

/**
 * 提交详细政策，获取分析报告
 */
exports.analyzeDetailedPolicy = async (req, res) => {
  try {
    const { title, content, analysis } = req.body;
    if (!title || !content || !analysis) {
      return res.status(400).json({ error: '提交的政策信息不完整' });
    }
    const policyId = uuidv4();
    // 保存政策到数据库
    await policyModel.savePolicy({
      id: policyId,
      title,
      content,
      createdAt: new Date()
    });
    // 调用AI服务生成报告
    const reportResult = await policyService.generatePolicyReport(
      title,
      content,
      analysis.questions
    );
    const reportId = uuidv4();
    // 保存报告到数据库
    await policyModel.saveReport({
      id: reportId,
      policyId,
      title: `《${title}》分析报告`,
      ...reportResult,
      generatedAt: new Date()
    });
    // 返回报告
    const report = await policyModel.getReportById(reportId);
    res.status(200).json(report);
  } catch (error) {
    console.error('政策分析报告生成失败:', error);
    res.status(500).json({ error: '政策分析报告生成失败，请重试' });
  }
};

/**
 * 获取政策详情
 */
exports.getPolicyDetail = async (req, res) => {
  try {
    const policyId = req.params.id;
    const policy = await policyModel.getPolicyById(policyId);
    if (!policy) {
      return res.status(404).json({ error: '未找到该政策' });
    }
    res.status(200).json(policy);
  } catch (error) {
    console.error('获取政策详情失败:', error);
    res.status(500).json({ error: '获取政策详情失败，请重试' });
  }
};

/**
 * 获取政策报告
 */
exports.getPolicyReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await policyModel.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ error: '未找到该报告' });
    }
    res.status(200).json(report);
  } catch (error) {
    console.error('获取政策报告失败:', error);
    res.status(500).json({ error: '获取政策报告失败，请重试' });
  }
};

/**
 * 导出政策报告到飞书
 */
exports.exportToFeishu = async (req, res) => {
  try {
    const { reportId } = req.body;
    
    if (!reportId) {
      return res.status(400).json({ error: '报告ID不能为空' });
    }
    
    console.log('开始导出报告到飞书，报告ID:', reportId);
    
    const feishuResult = await policyService.exportToFeishu(reportId);
    
    res.status(200).json({
      success: true,
      message: feishuResult.message || '成功导出到飞书文档',
      feishuUrl: feishuResult.url
    });
  } catch (error) {
    console.error('导出到飞书失败:', error);
    res.status(500).json({ 
      error: error.message || '导出到飞书失败，请重试' 
    });
  }
}; 