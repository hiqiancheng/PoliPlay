/**
 * Dify AI API 测试脚本
 * 用于验证API集成是否正常工作
 */

require('dotenv').config();
const aiClient = require('./utils/ai-client');

async function testDifyAPI() {
  console.log('🧪 开始测试 Dify AI API 集成...\n');
  
  // 测试政策分析功能
  console.log('📋 测试政策分析功能...');
  try {
    const testTitle = '关于促进新能源汽车发展的若干措施';
    const testContent = `
      为深入贯彻落实国家新能源汽车发展战略，促进我市新能源汽车产业高质量发展，
      现就促进新能源汽车发展提出以下措施：
      
      一、加大财政支持力度
      对购买新能源汽车的个人和单位给予一定比例的财政补贴。
      
      二、完善充电基础设施
      加快充电桩建设，优化充电网络布局，提高充电便利性。
      
      三、优化使用环境
      实施新能源汽车专用停车位、专用车道等便利措施。
      
      四、加强技术创新
      支持新能源汽车关键技术研发，提升产业核心竞争力。
    `;
    
    const analysisResult = await aiClient.analyzePolicy(testTitle, testContent);
    
    console.log('✅ 政策分析成功！');
    console.log('📝 政策总结:', analysisResult.summary);
    console.log('❓ 生成问题数量:', analysisResult.questions.length);
    console.log('📋 问题示例:', analysisResult.questions[0].title);
    
  } catch (error) {
    console.error('❌ 政策分析失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试报告生成功能
  console.log('📊 测试报告生成功能...');
  try {
    const testTitle = '关于促进新能源汽车发展的若干措施';
    const testContent = '测试政策内容';
    const testQuestions = [
      {
        id: 1,
        title: '该政策适用的地区范围是？',
        answer: '全市范围'
      },
      {
        id: 2,
        title: '该政策的主要关注领域是？',
        answer: '新能源汽车产业'
      }
    ];
    
    const reportResult = await aiClient.generatePolicyReport(testTitle, testContent, testQuestions);
    
    console.log('✅ 报告生成成功！');
    console.log('📝 报告总结:', reportResult.summary);
    console.log('📊 支持率:', reportResult.supportRate + '%');
    console.log('📊 反对率:', reportResult.opposeRate + '%');
    console.log('🏷️ 标签数量:', reportResult.tags.length);
    console.log('☁️ 词云数量:', reportResult.wordCloud.length);
    
  } catch (error) {
    console.error('❌ 报告生成失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 检查配置
  console.log('⚙️ 检查配置信息...');
  const config = require('./utils/config');
  console.log('🔑 API密钥配置:', config.aiApiKey ? '✅ 已配置' : '❌ 未配置');
  console.log('🌐 API地址:', config.aiApiUrl);
  
  if (!config.aiApiKey || config.aiApiKey === 'your_ai_api_key_here') {
    console.log('\n⚠️  警告: 请配置有效的 Dify AI API 密钥');
    console.log('📝 请编辑 .env 文件，设置 AI_API_KEY 环境变量');
  }
  
  console.log('\n🎉 测试完成！');
}

// 运行测试
if (require.main === module) {
  testDifyAPI().catch(console.error);
}

module.exports = testDifyAPI; 