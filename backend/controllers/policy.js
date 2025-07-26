const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const policyService = require('../services/policy');

// 内存中存储政策数据（实际应用中应使用数据库）
const policies = {};
const reports = {};

/**
 * 分析政策内容，获取主题总结和细化问题
 */
exports.analyzePolicy = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }
    
    // 调用一号接口（这里模拟，实际应调用AI服务）
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
    
    // 生成政策ID
    const policyId = uuidv4();
    
    // 保存政策信息
    policies[policyId] = {
      id: policyId,
      title,
      content,
      background: analysis.questions.map(q => ({
        question: q.title,
        answer: q.answer
      })),
      createdAt: new Date().toISOString()
    };
    
    // 调用二号接口（这里模拟，实际应调用AI服务）
    const reportResult = await policyService.generatePolicyReport(
      title, 
      content, 
      analysis.questions
    );
    
    // 生成报告ID
    const reportId = uuidv4();
    
    // 保存报告信息
    reports[reportId] = {
      id: reportId,
      policyId,
      title: `《${title}》分析报告`,
      summary: reportResult.summary,
      supportRate: reportResult.supportRate,
      opposeRate: reportResult.opposeRate,
      tags: reportResult.tags,
      wordCloud: reportResult.wordCloud,
      analysisHtml: reportResult.analysisHtml,
      generatedAt: new Date().toISOString()
    };
    
    // 将报告ID关联到政策
    policies[policyId].reportId = reportId;
    
    res.status(200).json(reports[reportId]);
  } catch (error) {
    console.error('政策分析报告生成失败:', error);
    res.status(500).json({ error: '政策分析报告生成失败，请重试' });
  }
};

/**
 * 获取政策详情
 */
exports.getPolicyDetail = (req, res) => {
  try {
    const policyId = req.params.id;
    
    if (!policies[policyId]) {
      return res.status(404).json({ error: '未找到该政策' });
    }
    
    res.status(200).json(policies[policyId]);
  } catch (error) {
    console.error('获取政策详情失败:', error);
    res.status(500).json({ error: '获取政策详情失败，请重试' });
  }
};

/**
 * 获取政策报告
 */
exports.getPolicyReport = (req, res) => {
  try {
    const reportId = req.params.id;
    
    if (!reports[reportId]) {
      return res.status(404).json({ error: '未找到该报告' });
    }
    
    res.status(200).json(reports[reportId]);
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
    
    if (!reportId || !reports[reportId]) {
      return res.status(404).json({ error: '未找到该报告' });
    }
    
    // 调用飞书API导出文档（这里模拟，实际应调用飞书API）
    const feishuResult = await policyService.exportToFeishu(reports[reportId]);
    
    res.status(200).json({
      success: true,
      message: '成功导出到飞书文档',
      feishuUrl: feishuResult.url
    });
  } catch (error) {
    console.error('导出到飞书失败:', error);
    res.status(500).json({ error: '导出到飞书失败，请重试' });
  }
}; 