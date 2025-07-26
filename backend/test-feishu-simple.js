const feishuClient = require('./utils/feishu-client');

async function testSimpleFeishu() {
  try {
    console.log('🚀 开始简化的飞书API测试...');
    
    // 1. 测试获取访问令牌
    console.log('1️⃣ 测试获取访问令牌...');
    const token = await feishuClient.getAccessToken();
    console.log('✅ 访问令牌获取成功');
    
    // 2. 创建一个简单的测试报告
    console.log('2️⃣ 创建测试文档...');
    const testReport = {
      title: '测试政策报告',
      summary: '这是一个测试报告，用于验证飞书API集成。',
      supportRate: 80,
      opposeRate: 10,
      tags: ['测试', 'API'],
      comments: [
        {
          role: '测试用户',
          score: 4,
          comment: '这是一条测试评论。'
        }
      ],
      generatedAt: new Date()
    };
    
    const result = await feishuClient.createDocument(testReport);
    console.log('✅ 文档创建成功!');
    console.log('📄 文档链接:', result.url);
    console.log('🆔 文档ID:', result.documentId);
    
    console.log('🎉 测试完成，所有功能正常！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response && error.response.data) {
      console.error('📝 详细错误信息:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 运行测试
testSimpleFeishu(); 