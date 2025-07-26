const axios = require('axios');
const config = require('./config');

/**
 * AI客户端
 * 用于与Dify AI服务进行交互
 */
class AIClient {
  constructor() {
    this.apiKey = config.aiApiKey;
    this.apiUrl = config.aiApiUrl;
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }
  
  /**
   * 分析政策内容，获取主题总结和细化问题（一号接口）
   * @param {String} title 政策标题
   * @param {String} content 政策内容
   * @returns {Promise} 分析结果
   */
  async analyzePolicy(title, content) {
    try {
      // 构建发送给Dify AI的查询内容
      const query = `#政策标题：${title}
# 政策内容：${content}`;

      // 调用Dify AI聊天消息API
      const response = await this.client.post('/chat-messages', {
        query: query,
        response_mode: 'blocking',
        user: 'policy-analyzer',
        inputs: {}
      });

      // 解析AI返回的答案
      const aiAnswer = response.data.answer;
      
      // 尝试解析JSON格式的答案
      let analysisResult;
      try {
        // 查找JSON内容（可能在markdown代码块中）
        const jsonMatch = aiAnswer.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[1]);
        } else {
          // 尝试直接解析整个答案
          analysisResult = JSON.parse(aiAnswer);
        }
      } catch (parseError) {
        console.warn('AI返回的内容不是有效的JSON格式，使用默认结构');
        // 如果解析失败，使用默认结构
        analysisResult = {
          summary: aiAnswer || `这是关于"${title}"的政策分析。该政策主要涉及经济发展、社会治理和环境保护等方面，旨在促进可持续发展和社会和谐。`,
          questions: [
            {
              id: 1,
              type: 'text',
              title: '该政策适用的地区范围是？',
              placeholder: '例如：全国范围、某省、某市等',
              answer: ''
            },
            {
              id: 2,
              type: 'choice',
              title: '该政策的主要关注领域是？',
              options: ['经济发展', '社会治理', '环境保护', '科技创新', '民生改善'],
              answer: ''
            },
            {
              id: 3,
              type: 'text',
              title: '该政策的实施时间是？',
              placeholder: '例如：2023年1月1日起实施',
              answer: ''
            },
            {
              id: 4,
              type: 'multiple',
              title: '该政策涉及的主要人群包括？（可多选）',
              options: ['青年创业者', '农村居民', '高新技术企业', '城市低收入群体', '老年人'],
              answer: []
            },
            {
              id: 5,
              type: 'text',
              title: '该政策的背景和出台原因是？',
              placeholder: '例如：应对经济下行压力、促进产业转型升级等',
              answer: ''
            },
            {
              id: 6,
              type: 'boolean',
              title: '该政策是否为首次出台？',
              answer: null
            },
            {
              id: 7,
              type: 'text',
              title: '该政策的主要目标是什么？',
              placeholder: '例如：促进经济发展，提高生活水平，实现可持续发展目标等',
              answer: ''
            },
            {
              id: 8,
              type: 'text',
              title: '该政策与现有政策的关系是？',
              placeholder: '例如：是对某政策的补充、替代或完善',
              answer: ''
            }
          ]
        };
      }

      return analysisResult;
    } catch (error) {
      console.error('AI分析政策失败:', error);
      
      // 如果API调用失败，返回模拟数据作为备用
      return {
        summary: `这是关于"${title}"的政策分析。该政策主要涉及经济发展、社会治理和环境保护等方面，旨在促进可持续发展和社会和谐。`,
        questions: [
          {
            id: 1,
            type: 'text',
            title: '该政策适用的地区范围是？',
            placeholder: '例如：全国范围、某省、某市等',
            answer: ''
          },
          {
            id: 2,
            type: 'choice',
            title: '该政策的主要关注领域是？',
            options: ['经济发展', '社会治理', '环境保护', '科技创新', '民生改善'],
            answer: ''
          },
          {
            id: 3,
            type: 'text',
            title: '该政策的实施时间是？',
            placeholder: '例如：2023年1月1日起实施',
            answer: ''
          },
          {
            id: 4,
            type: 'multiple',
            title: '该政策涉及的主要人群包括？（可多选）',
            options: ['青年创业者', '农村居民', '高新技术企业', '城市低收入群体', '老年人'],
            answer: []
          },
          {
            id: 5,
            type: 'text',
            title: '该政策的背景和出台原因是？',
            placeholder: '例如：应对经济下行压力、促进产业转型升级等',
            answer: ''
          },
          {
            id: 6,
            type: 'boolean',
            title: '该政策是否为首次出台？',
            answer: null
          },
          {
            id: 7,
            type: 'text',
            title: '该政策的主要目标是什么？',
            placeholder: '例如：促进经济发展，提高生活水平，实现可持续发展目标等',
            answer: ''
          },
          {
            id: 8,
            type: 'text',
            title: '该政策与现有政策的关系是？',
            placeholder: '例如：是对某政策的补充、替代或完善',
            answer: ''
          }
        ]
      };
    }
  }
  
  /**
   * 生成政策分析报告（二号接口）
   * @param {String} title 政策标题
   * @param {String} content 政策内容
   * @param {Array} questions 细化问题及回答
   * @returns {Promise} 分析报告
   */
  async generatePolicyReport(title, content, questions) {
    try {
      // 构建发送给Dify AI的查询内容
      const query = `政策标题：${title}
政策内容：${content}
问题回答：
${questions.map((q, index) => `${index + 1}. ${q.title}: ${q.answer}`).join('\n')}`;

      // 调用Dify AI聊天消息API
      const response = await this.client.post('/chat-messages', {
        query: query,
        response_mode: 'blocking',
        user: 'policy-analyzer',
        inputs: {}
      });

      // 解析AI返回的答案
      const aiAnswer = response.data.answer;
      // 尝试解析JSON格式的答案
      let reportResult;
      try {
        // 查找JSON内容（可能在markdown代码块中）
        const jsonMatch = aiAnswer.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          reportResult = JSON.parse(jsonMatch[1]);
        } else {
          // 尝试直接解析整个答案
          reportResult = JSON.parse(aiAnswer);
        }
      } catch (parseError) {
        console.warn('AI返回的内容不是有效的JSON格式，使用默认结构');
        // 如果解析失败，使用默认结构
        reportResult = [
          { role: '农民', comment: '这个政策对我们农村有帮助。', score: 4 },
          { role: '工人', comment: '希望政策能落实到位。', score: 3 },
          { role: '企业家', comment: '有利于企业发展。', score: 5 },
          { role: '学生', comment: '希望有更多教育支持。', score: 4 }
        ];
      }
      return reportResult;
    } catch (error) {
      console.error('AI生成政策报告失败:', error);
      
      // 如果API调用失败，返回模拟数据作为备用
      return [
        { role: '农民', comment: '这个政策对我们农村有帮助。', score: 4 },
        { role: '工人', comment: '希望政策能落实到位。', score: 3 },
        { role: '企业家', comment: '有利于企业发展。', score: 5 },
        { role: '学生', comment: '希望有更多教育支持。', score: 4 }
      ];
    }
  }
}

module.exports = new AIClient(); 