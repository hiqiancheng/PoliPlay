const aiClient = require('../utils/ai-client');
const feishuClient = require('../utils/feishu-client');

/**
 * 分析政策内容，获取主题总结和细化问题（一号接口）
 * @param {String} title 政策标题
 * @param {String} content 政策内容
 * @returns {Object} 分析结果
 */
exports.analyzePolicy = async (title, content) => {
  try {
    return await aiClient.analyzePolicy(title, content);
  } catch (error) {
    console.error('政策分析失败:', error);
    throw error;
  }
};

/**
 * 生成政策分析报告（二号接口）
 * @param {String} title 政策标题
 * @param {String} content 政策内容
 * @param {Array} questions 细化问题及回答
 * @returns {Object} 分析报告
 */
exports.generatePolicyReport = async (title, content, questions) => {
  try {
    return await aiClient.generatePolicyReport(title, content, questions);
  } catch (error) {
    console.error('政策分析报告生成失败:', error);
    throw error;
  }
};

/**
 * 导出政策报告到飞书
 * @param {Object} report 政策报告
 * @returns {Object} 导出结果
 */
exports.exportToFeishu = async (report) => {
  try {
    return await feishuClient.createDocument(report);
  } catch (error) {
    console.error('导出到飞书失败:', error);
    throw error;
  }
}; 