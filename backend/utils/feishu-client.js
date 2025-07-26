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
      console.log('正在获取飞书访问令牌...');

      const response = await this.client.post('/auth/v3/tenant_access_token/internal', {
        app_id: this.appId,
        app_secret: this.appSecret
      });
      
      if (response.data && response.data.code === 0) {
        this.accessToken = response.data.tenant_access_token;
        this.tokenExpireTime = now + (response.data.expire - 300) * 1000; // 提前5分钟过期
        console.log('飞书访问令牌获取成功');
        return this.accessToken;
      } else {
        console.error('飞书API返回错误:', response.data);
        throw new Error(`获取飞书访问令牌失败: ${response.data.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('获取飞书访问令牌失败:', error.message);
      if (error.response) {
        console.error('响应数据:', error.response.data);
        console.error('响应状态:', error.response.status);
      }
      throw new Error('获取飞书访问令牌失败，请检查App ID和App Secret是否正确');
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
      console.log('正在创建飞书文档...');
      
      // 创建文档
      const createResponse = await this.client.post('/docx/v1/documents', {
        title: report.title || '政策分析报告'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (createResponse.data && createResponse.data.code === 0) {
        const documentId = createResponse.data.data.document.document_id;
        // 构造飞书文档访问URL
        const documentUrl = `https://feishu.cn/docx/${documentId}`;
        
        console.log('飞书文档创建成功，文档ID:', documentId);
        console.log('飞书文档URL:', documentUrl);
        
        // 更新文档内容
        await this.updateDocumentContent(documentId, report, token);
        
        return {
          success: true,
          url: documentUrl,
          documentId: documentId
        };
      } else {
        console.error('飞书API返回错误:', createResponse.data);
        throw new Error(`创建飞书文档失败: ${createResponse.data.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('创建飞书文档失败:', error.message);
      if (error.response) {
        console.error('响应数据:', error.response.data);
        console.error('响应状态:', error.response.status);
      }
      throw new Error('创建飞书文档失败，请重试');
    }
  }
  
  /**
   * 更新文档内容
   * @param {String} documentId 文档ID
   * @param {Object} report 政策报告
   * @param {String} token 访问令牌
   * @returns {Promise<void>}
   */
  async updateDocumentContent(documentId, report, token) {
    try {
      console.log('正在更新文档内容...');
      
      // 构建文档内容块
      const blocks = this.buildDocumentBlocks(report);
      
      // 使用创建块API而不是批量更新API
      const children = blocks.map(block => ({
        block_type: 2, // 文本块类型
        text: {
          elements: block.elements,
          style: {}
        }
      }));

      // 创建文档内容块
      await this.client.post(`/docx/v1/documents/${documentId}/blocks/${documentId}/children`, {
        index: 0,
        children: children
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('文档内容更新完成');
    } catch (error) {
      console.error('更新飞书文档内容失败:', error.message);
      if (error.response) {
        console.error('响应数据:', JSON.stringify(error.response.data));
      }
      throw new Error('更新飞书文档内容失败，请重试');
    }
  }
  
  /**
   * 构建文档内容块
   * @param {Object} report 政策报告
   * @returns {Array} 文档内容块数组
   */
  buildDocumentBlocks(report) {
    const blocks = [];
    
    // 主标题 - 大号加粗
    blocks.push({
      elements: [
        {
          text_run: {
            content: report.title || '政策分析报告',
            text_element_style: {
              bold: true
            }
          }
        }
      ]
    });
    
    // 生成时间 - 斜体
    blocks.push({
      elements: [
        {
          text_run: {
            content: `生成时间: ${new Date(report.generatedAt).toLocaleString('zh-CN')}`,
            text_element_style: {
              italic: true
            }
          }
        }
      ]
    });
    
    // 分隔线
    blocks.push({
      elements: [
        {
          text_run: {
            content: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          }
        }
      ]
    });
    
    // 空行
    blocks.push({
      elements: [
        {
          text_run: {
            content: ""
          }
        }
      ]
    });
    
    // 执行摘要标题
    blocks.push({
      elements: [
        {
          text_run: {
            content: "📋 执行摘要",
            text_element_style: {
              bold: true,
              text_color: 3 // 绿色
            }
          }
        }
      ]
    });
    
    // 政策总结
    blocks.push({
      elements: [
        {
          text_run: {
            content: report.summary || '暂无总结'
          }
        }
      ]
    });
    
    // 空行
    blocks.push({
      elements: [
        {
          text_run: {
            content: ""
          }
        }
      ]
    });
    
    // 支持度与反对度标题
    blocks.push({
      elements: [
        {
          text_run: {
            content: "📊 民意分析",
            text_element_style: {
              bold: true,
              text_color: 5 // 橙色
            }
          }
        }
      ]
    });
    
    // 支持度统计
    const supportRate = report.supportRate || 0;
    const opposeRate = report.opposeRate || 0;
    const neutralRate = 100 - supportRate - opposeRate;
    
    blocks.push({
      elements: [
        {
          text_run: {
            content: "• 支持度: ",
            text_element_style: {
              bold: true
            }
          }
        },
        {
          text_run: {
            content: `${supportRate}%`,
            text_element_style: {
              bold: true,
              text_color: 3, // 绿色
              background_color: 14 // 浅绿背景
            }
          }
        }
      ]
    });
    
    blocks.push({
      elements: [
        {
          text_run: {
            content: "• 反对度: ",
            text_element_style: {
              bold: true
            }
          }
        },
        {
          text_run: {
            content: `${opposeRate}%`,
            text_element_style: {
              bold: true,
              text_color: 6, // 红色
              background_color: 15 // 浅红背景
            }
          }
        }
      ]
    });
    
    if (neutralRate > 0) {
      blocks.push({
        elements: [
          {
            text_run: {
              content: "• 中性态度: ",
              text_element_style: {
                bold: true
              }
            }
          },
          {
            text_run: {
              content: `${neutralRate}%`,
              text_element_style: {
                bold: true,
                text_color: 7, // 灰色
                background_color: 15 // 浅灰背景
              }
            }
          }
        ]
      });
    }
    
    // 政策标签
    if (report.tags && report.tags.length > 0) {
      blocks.push({
        elements: [
          {
            text_run: {
              content: ""
            }
          }
        ]
      });
      
      blocks.push({
        elements: [
          {
            text_run: {
              content: "🏷️ 政策标签",
              text_element_style: {
                bold: true,
                text_color: 4 // 紫色
              }
            }
          }
        ]
      });
      
      blocks.push({
        elements: report.tags.map(tag => ({
          text_run: {
            content: `#${tag} `,
            text_element_style: {
              background_color: 14, // 蓝色背景
              text_color: 1
            }
          }
        }))
      });
    }
    
    // 详细分析
    blocks.push({
      elements: [
        {
          text_run: {
            content: ""
          }
        }
      ]
    });
    
    blocks.push({
      elements: [
        {
          text_run: {
            content: "📈 详细分析",
            text_element_style: {
              bold: true,
              text_color: 2 // 深蓝色
            }
          }
        }
      ]
    });
    
    // 政策影响评估
    blocks.push({
      elements: [
        {
          text_run: {
            content: "政策影响评估:",
            text_element_style: {
              bold: true,
              underline: true
            }
          }
        }
      ]
    });
    
    const avgScore = report.comments ? 
      (report.comments.reduce((sum, comment) => sum + (comment.score || 0), 0) / report.comments.length).toFixed(1) : 
      "0";
    
    blocks.push({
      elements: [
        {
          text_run: {
            content: `• 综合评分: ${avgScore}/5.0\n• 参与评估角色数量: ${report.comments?.length || 0}个\n• 政策复杂度: ${report.tags?.length > 3 ? '高' : report.tags?.length > 1 ? '中' : '低'}`
          }
        }
      ]
    });
    
    // 角色意见
    if (report.comments && report.comments.length > 0) {
      blocks.push({
        elements: [
          {
            text_run: {
              content: ""
            }
          }
        ]
      });
      
      blocks.push({
        elements: [
          {
            text_run: {
              content: "💬 各方角色意见",
              text_element_style: {
                bold: true,
                text_color: 7 // 深绿色
              }
            }
          }
        ]
      });
      
      report.comments.forEach((comment, index) => {
        // 角色名称和评分
        blocks.push({
          elements: [
            {
              text_run: {
                content: `${index + 1}. `,
                text_element_style: {
                  bold: true
                }
              }
            },
            {
              text_run: {
                content: comment.role,
                text_element_style: {
                  bold: true,
                  text_color: 1
                }
              }
            },
            {
              text_run: {
                content: ` (评分: ${comment.score}/5`,
                text_element_style: {
                  italic: true
                }
              }
            },
            {
              text_run: {
                content: "★".repeat(comment.score) + "☆".repeat(5 - comment.score),
                text_element_style: {
                  text_color: comment.score >= 4 ? 3 : comment.score >= 3 ? 5 : 6
                }
              }
            },
            {
              text_run: {
                content: ")",
                text_element_style: {
                  italic: true
                }
              }
            }
          ]
        });
        
        // 意见内容
        blocks.push({
          elements: [
            {
              text_run: {
                content: `   "${comment.comment}"`,
                text_element_style: {
                  italic: true
                }
              }
            }
          ]
        });
        
        // 角色间空行
        if (index < report.comments.length - 1) {
          blocks.push({
            elements: [
              {
                text_run: {
                  content: ""
                }
              }
            ]
          });
        }
      });
    }
    
    // 结论和建议
    blocks.push({
      elements: [
        {
          text_run: {
            content: ""
          }
        }
      ]
    });
    
    blocks.push({
      elements: [
        {
          text_run: {
            content: "🎯 结论与建议",
            text_element_style: {
              bold: true,
              text_color: 6 // 红色
            }
          }
        }
      ]
    });
    
    // 基于数据生成建议
    let recommendation = "";
    if (supportRate >= 70) {
      recommendation = "该政策获得了较高的支持度，建议优先推进实施。";
    } else if (supportRate >= 50) {
      recommendation = "该政策获得了一定支持，建议进一步完善细节后实施。";
    } else if (opposeRate >= 50) {
      recommendation = "该政策面临较强反对，建议重新审视政策内容或暂缓实施。";
    } else {
      recommendation = "该政策意见分化明显，建议加强沟通协调，寻求更广泛共识。";
    }
    
    blocks.push({
      elements: [
        {
          text_run: {
            content: recommendation,
            text_element_style: {
              background_color: 13, // 黄色背景
              bold: true
            }
          }
        }
      ]
    });
    
    // 报告结尾
    blocks.push({
      elements: [
        {
          text_run: {
            content: ""
          }
        }
      ]
    });
    
    blocks.push({
      elements: [
        {
          text_run: {
            content: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          }
        }
      ]
    });
    
    blocks.push({
      elements: [
        {
          text_run: {
            content: "本报告由 PoliPlay 政策分析系统自动生成",
            text_element_style: {
              italic: true,
              text_color: 7
            }
          }
        }
      ]
    });
    
    return blocks;
  }
}

module.exports = new FeishuClient(); 