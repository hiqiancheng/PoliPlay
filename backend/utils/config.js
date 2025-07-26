/**
 * 配置工具
 * 用于获取环境变量配置
 */

// 默认配置
const defaultConfig = {
  port: 5000,
  nodeEnv: 'development',
  aiApiKey: 'your_ai_api_key_here',
  aiApiUrl: 'https://api.example.com/ai',
  feishuAppId: 'your_feishu_app_id_here',
  feishuAppSecret: 'your_feishu_app_secret_here',
  feishuApiUrl: 'https://open.feishu.cn/open-apis'
};

/**
 * 获取配置
 * 优先从环境变量获取，如果没有则使用默认配置
 */
const config = {
  port: process.env.PORT || defaultConfig.port,
  nodeEnv: process.env.NODE_ENV || defaultConfig.nodeEnv,
  aiApiKey: process.env.AI_API_KEY || defaultConfig.aiApiKey,
  aiApiUrl: process.env.AI_API_URL || defaultConfig.aiApiUrl,
  feishuAppId: process.env.FEISHU_APP_ID || defaultConfig.feishuAppId,
  feishuAppSecret: process.env.FEISHU_APP_SECRET || defaultConfig.feishuAppSecret,
  feishuApiUrl: process.env.FEISHU_API_URL || defaultConfig.feishuApiUrl
};

module.exports = config; 