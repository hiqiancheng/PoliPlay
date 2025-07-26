import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加认证信息等
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    return Promise.reject(error);
  }
);

// 政策相关API
export default {
  /**
   * 分析政策内容，获取主题总结和细化问题
   * @param {Object} data 包含标题和内容的对象
   * @returns {Promise} 返回分析结果
   */
  analyzePolicy(data) {
    return api.post('/policy/analyze', data);
  },
  
  /**
   * 提交详细政策，获取分析报告
   * @param {Object} data 包含政策信息和回答的对象
   * @returns {Promise} 返回分析报告
   */
  analyzeDetailedPolicy(data) {
    return api.post('/policy/analyze-detailed', data);
  },
  
  /**
   * 获取政策详情
   * @param {String} id 政策ID
   * @returns {Promise} 返回政策详情
   */
  getPolicyDetail(id) {
    return api.get(`/policy/${id}`);
  },
  
  /**
   * 获取政策报告
   * @param {String} id 政策ID
   * @returns {Promise} 返回政策报告
   */
  getPolicyReport(id) {
    return api.get(`/policy/report/${id}`);
  },
  
  /**
   * 导出政策报告到飞书
   * @param {Object} data 包含报告ID的对象
   * @returns {Promise} 返回导出结果
   */
  exportToFeishu(data) {
    return api.post('/policy/export-to-feishu', data);
  }
}; 