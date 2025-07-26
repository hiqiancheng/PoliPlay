/**
 * 配置工具
 * 用于获取环境变量配置
 */

// 默认配置
const defaultConfig = {
  port: 5000,
  nodeEnv: 'development',
  // 细化Agent API配置（一号接口）
  refineAgentApiKey: 'your_refine_agent_api_key_here',
  refineAgentApiUrl: 'https://api.dify.ai/v1',
  // 分析Agent API配置（二号接口）
  analyzeAgentApiKey: 'your_analyze_agent_api_key_here',
  analyzeAgentApiUrl: 'https://api.dify.ai/v1',
  // 飞书配置
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
  // 细化Agent配置
  refineAgentApiKey: process.env.REFINE_AGENT_API_KEY || defaultConfig.refineAgentApiKey,
  refineAgentApiUrl: process.env.REFINE_AGENT_API_URL || defaultConfig.refineAgentApiUrl,
  // 分析Agent配置
  analyzeAgentApiKey: process.env.ANALYZE_AGENT_API_KEY || defaultConfig.analyzeAgentApiKey,
  analyzeAgentApiUrl: process.env.ANALYZE_AGENT_API_URL || defaultConfig.analyzeAgentApiUrl,
  // 飞书配置
  feishuAppId: process.env.FEISHU_APP_ID || defaultConfig.feishuAppId,
  feishuAppSecret: process.env.FEISHU_APP_SECRET || defaultConfig.feishuAppSecret,
  feishuApiUrl: process.env.FEISHU_API_URL || defaultConfig.feishuApiUrl
};

module.exports = config; 