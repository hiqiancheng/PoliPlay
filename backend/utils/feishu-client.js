const axios = require('axios');
const config = require('./config');

/**
 * 飞书客户端
 * 用于与飞书API进行交互
 */
class FeishuClient {
  constructor() {
    this.appId = config.feishuAppId;
    this.appSecret = config.feishuAppSecret;
    this.apiUrl = config.feishuApiUrl;
    this.accessToken = null;
    this.tokenExpireTime = 0;
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  /**
   * 获取访问令牌
   * @returns {Promise<string>} 访问令牌
   */
  async getAccessToken() {
    // 如果令牌未过期，直接返回
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpireTime) {
      return this.accessToken;
    }
    
    try {
      // 实际应用中，这里应该调用飞书API获取令牌
      // 这里为了演示，直接返回模拟数据
      this.accessToken = 'mock_access_token';
      this.tokenExpireTime = now + 7200 * 1000; // 模拟2小时过期
      return this.accessToken;
      
      // 实际API调用示例：
      // const response = await this.client.post('/auth/v3/tenant_access_token/internal', {
      //   app_id: this.appId,
      //   app_secret: this.appSecret
      // });
      // 
      // if (response.data && response.data.code === 0) {
      //   this.accessToken = response.data.tenant_access_token;
      //   this.tokenExpireTime = now + response.data.expire * 1000;
      //   return this.accessToken;
      // } else {
      //   throw new Error('获取飞书访问令牌失败');
      // }
    } catch (error) {
      console.error('获取飞书访问令牌失败:', error);
      throw new Error('获取飞书访问令牌失败，请重试');
    }
  }
  
  /**
   * 创建飞书文档
   * @param {Object} report 政策报告
   * @returns {Promise<Object>} 创建结果
   */
  async createDocument(report) {
    try {
      const token = await this.getAccessToken();
      
      // 实际应用中，这里应该调用飞书API创建文档
      // 这里为了演示，直接返回模拟数据
      return {
        success: true,
        url: 'https://feishu.example.com/docs/doccnxxxxxxxxxxxxxxxx'
      };
      
      // 实际API调用示例：
      // const response = await this.client.post('/docx/v1/documents', {
      //   title: report.title,
      //   folder_token: 'your_folder_token'
      // }, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // 
      // if (response.data && response.data.code === 0) {
      //   const documentId = response.data.data.document_id;
      //   await this.updateDocumentContent(documentId, report);
      //   return {
      //     success: true,
      //     url: `https://feishu.cn/docs/${documentId}`
      //   };
      // } else {
      //   throw new Error('创建飞书文档失败');
      // }
    } catch (error) {
      console.error('创建飞书文档失败:', error);
      throw new Error('创建飞书文档失败，请重试');
    }
  }
  
  /**
   * 更新文档内容
   * @param {String} documentId 文档ID
   * @param {Object} report 政策报告
   * @returns {Promise<void>}
   */
  async updateDocumentContent(documentId, report) {
    try {
      const token = await this.getAccessToken();
      
      // 构建文档内容
      const content = this.buildDocumentContent(report);
      
      // 实际应用中，这里应该调用飞书API更新文档内容
      // 这里为了演示，不做实际操作
      console.log('更新文档内容:', documentId, content);
      
      // 实际API调用示例：
      // await this.client.post(`/docx/v1/documents/${documentId}/blocks/batch_update`, {
      //   requests: [
      //     {
      //       insert_paragraph: {
      //         location: {
      //           index: 0
      //         },
      //         paragraph: {
      //           elements: [
      //             {
      //               text_run: {
      //                 text: content
      //               }
      //             }
      //           ]
      //         }
      //       }
      //     }
      //   ]
      // }, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
    } catch (error) {
      console.error('更新飞书文档内容失败:', error);
      throw new Error('更新飞书文档内容失败，请重试');
    }
  }
  
  /**
   * 构建文档内容
   * @param {Object} report 政策报告
   * @returns {String} 文档内容
   */
  buildDocumentContent(report) {
    // 这里简单处理，实际应用中应该根据飞书文档API的要求构建更复杂的内容
    return `
      # ${report.title}
      
      生成时间: ${new Date(report.generatedAt).toLocaleString('zh-CN')}
      
      ## 政策总结
      
      ${report.summary}
      
      ## 支持度与反对度
      
      - 支持度: ${report.supportRate}%
      - 反对度: ${report.opposeRate}%
      
      ## 政策标签
      
      ${report.tags.join('、')}
      
      ## 详细分析
      
      ${report.analysisHtml.replace(/<[^>]+>/g, '')}
    `;
  }
}

module.exports = new FeishuClient(); 