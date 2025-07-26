const aiClient = require('../utils/ai-client');
const feishuClient = require('../utils/feishu-client');
const jieba = require('nodejieba');

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
    // AI返回的是包含comments、tags、report的对象
    const aiResult = await aiClient.generatePolicyReport(title, content, questions);
    console.log('AI返回结果:', aiResult);
    
    // 从AI结果中提取数据
    const commentsArr = aiResult.comments || [];
    const aiTags = aiResult.tags || [];
    const reportText = aiResult.report || '';
    
    // 统计词云（基于评论内容和报告内容）
    const allText = [
      ...commentsArr.map(item => item.comment),
      reportText
    ].join(' ');
    
    // 定义停用词列表
    const stopWords = new Set([
      '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '个', '上', '也', '很', '到', '说', '要', '去',
      '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '里', '来', '他', '时候', '过', '下', '可以', '后', '多',
      '于', '把', '为', '但', '却', '又', '与', '及', '而', '且', '或', '所以', '因为', '如果', '虽然', '然而', '不过',
      '对于', '关于', '根据', '按照', '通过', '由于', '这个', '那个', '这些', '那些', '进行', '实现', '提高', '加强',
      '能够', '应该', '需要', '可能', '比较', '非常', '相当', '比如', '例如', '等等', '以及', '还有', '同时', '另外'
    ]);
    
    // 添加政策相关的自定义词汇到jieba词典
    const policyTerms = [
      '政策实施', '制度建设', '改革开放', '经济发展', '社会保障', '民生工程',
      '公共服务', '监管体系', '法治建设', '创新驱动', '绿色发展', '数字化转型',
      '营商环境', '产业升级', '区域协调', '城乡统筹', '精准扶贫', '乡村振兴',
      '教育改革', '医疗卫生', '养老保险', '就业创业', '住房保障', '环境保护'
    ];
    
    // 将政策术语添加到jieba词典
    policyTerms.forEach(term => {
      jieba.insertWord(term);
    });
    
    // 使用jieba进行专业中文分词
    const words = jieba.cut(allText);
   
    // 词频统计，过滤停用词和单字
    const freqMap = {};
    words.forEach(word => {
      const trimmedWord = word.trim();
      if (trimmedWord.length >= 2 && !stopWords.has(trimmedWord) && /[\u4e00-\u9fa5]/.test(trimmedWord)) {
        freqMap[trimmedWord] = (freqMap[trimmedWord] || 0) + 1;
      }
    });
    
    // 生成词云数组
    let wordCloud = Object.entries(freqMap)
      .map(([text, weight]) => ({ text, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 30); // 取前30高频词
    
    // 如果词云数据不足，使用AI提供的tags作为补充
    if (wordCloud.length < 10) {
      const supplementWords = aiTags.map((tag, index) => ({
        text: tag,
        weight: Math.max(15 - index * 2, 1) // 递减权重
      }));
      
      // 合并并去重
      const existingTexts = new Set(wordCloud.map(item => item.text));
      supplementWords.forEach(item => {
        if (!existingTexts.has(item.text)) {
          wordCloud.push(item);
        }
      });
      
      // 如果还是不够，添加默认词汇
      if (wordCloud.length < 10) {
        const defaultWords = [
          { text: '政策实施', weight: 15 },
          { text: '社会效应', weight: 12 },
          { text: '经济影响', weight: 11 },
          { text: '民生改善', weight: 10 },
          { text: '制度创新', weight: 9 },
          { text: '规范管理', weight: 8 },
          { text: '公平公正', weight: 7 },
          { text: '效率提升', weight: 6 },
          { text: '风险控制', weight: 5 },
          { text: '协调发展', weight: 4 }
        ];
        
        defaultWords.forEach(item => {
          if (!existingTexts.has(item.text)) {
            wordCloud.push(item);
          }
        });
      }
    }

    // 优先使用AI返回的tags，如果没有则使用词频统计的结果
    const tags = aiTags.length > 0 ? aiTags.slice(0, 6) : wordCloud.slice(0, 5).map(item => item.text);

    // 统计支持率/反对率（4分及以上为支持，2分及以下为反对）
    const total = commentsArr.length;
    const support = commentsArr.filter(c => c.score >= 4).length;
    const oppose = commentsArr.filter(c => c.score <= 2).length;
    const supportRate = total ? Math.round((support / total) * 100) : 0;
    const opposeRate = total ? Math.round((oppose / total) * 100) : 0;

    // 生成summary
    const summary = total > 0 
      ? `本政策共收到${total}个不同角色的评论，支持率${supportRate}%，反对率${opposeRate}%。`
      : '本政策分析报告已生成，包含详细的政策解读和分析。';
    
    // 生成analysisHtml，包含角色评论和完整报告
    let analysisHtml = '';
    
    if (commentsArr.length > 0) {
      analysisHtml += `
        <h4>角色评论</h4>
        <ul>
          ${commentsArr.map(c => `<li><b>${c.role}</b>（${c.score}分）：${c.comment}</li>`).join('')}
        </ul>
      `;
    }
    
    if (reportText && reportText !== '报告全文') {
      analysisHtml += `
        <h4>详细分析报告</h4>
        <div class="report-content">
          ${reportText.replace(/\n/g, '<br>')}
        </div>
      `;
    }

    return {
      summary,
      supportRate,
      opposeRate,
      tags,
      wordCloud,
      analysisHtml,
      comments: commentsArr,
      report: reportText
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