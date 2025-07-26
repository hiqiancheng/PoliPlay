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
    // AI返回的是角色评论数组
    const commentsArr = await aiClient.generatePolicyReport(title, content, questions);
console.log(commentsArr)
    // 统计tags（出现频率最高的N个词）和wordCloud（词频统计）
    const allText = commentsArr.map(item => item.comment).join(' ');
    // 简单分词（按中文单字或英文单词分割）
    const words = allText.match(/[\u4e00-\u9fa5]|[a-zA-Z0-9]+/g) || [];
    const freqMap = {};
    words.forEach(w => { freqMap[w] = (freqMap[w] || 0) + 1; });
    // 生成词云数组
    const wordCloud = Object.entries(freqMap)
      .map(([text, weight]) => ({ text, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 30); // 取前30高频词
    // 生成tags（取前5高频词）
    const tags = wordCloud.slice(0, 5).map(item => item.text);

    // 统计支持率/反对率（4分及以上为支持，2分及以下为反对）
    const total = commentsArr.length;
    const support = commentsArr.filter(c => c.score >= 4).length;
    const oppose = commentsArr.filter(c => c.score <= 2).length;
    const supportRate = total ? Math.round((support / total) * 100) : 0;
    const opposeRate = total ? Math.round((oppose / total) * 100) : 0;

    // 生成summary和analysisHtml
    const summary = `本政策共收到${total}个不同角色的评论，支持率${supportRate}%，反对率${opposeRate}%。`;
    const analysisHtml = `
      <h4>角色评论</h4>
      <ul>
        ${commentsArr.map(c => `<li><b>${c.role}</b>（${c.score}分）：${c.comment}</li>`).join('')}
      </ul>
    `;

    return {
      summary,
      supportRate,
      opposeRate,
      tags,
      wordCloud,
      analysisHtml,
      comments: commentsArr
    };
  } catch (error) {
    console.error('政策分析报告生成失败:', error);
    throw error;
  }
};

/**
 * 导出政策报告到飞书
 * @param {String} reportId 报告ID
 * @returns {Object} 导出结果
 */
exports.exportToFeishu = async (reportId) => {
  try {
    const policyModel = require('../models/policy');
    
    // 获取报告详情
    const report = await policyModel.getReportById(reportId);
    if (!report) {
      throw new Error('报告不存在');
    }
    
    // 检查是否已经导出过
    if (report.feishuDocUrl) {
      console.log('报告已存在飞书文档，直接返回链接');
      return {
        success: true,
        url: report.feishuDocUrl,
        message: '文档已存在，直接返回'
      };
    }
    
    // 创建飞书文档
    console.log('开始创建飞书文档...');
    const result = await feishuClient.createDocument(report);
    
    if (result.success) {
      // 保存飞书文档信息到数据库
      await policyModel.updateReportFeishu(reportId, result.url, result.documentId);
      console.log('飞书文档信息已保存到数据库');
      
      return {
        success: true,
        url: result.url,
        message: '文档创建成功'
      };
    } else {
      throw new Error('创建飞书文档失败');
    }
  } catch (error) {
    console.error('导出到飞书失败:', error);
    throw error;
  }
}; 