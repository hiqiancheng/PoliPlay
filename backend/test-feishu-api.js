const feishuClient = require('./utils/feishu-client');

async function testFeishuAPI() {
  try {
    console.log('开始测试飞书API...');
    
    // 测试获取访问令牌
    console.log('1. 测试获取访问令牌...');
    const token = await feishuClient.getAccessToken();
    console.log('✅ 访问令牌获取成功:', token.substring(0, 20) + '...');
    
    // 测试创建文档
    console.log('2. 测试创建文档...');
    const mockReport = {
      title: '测试政策分析报告',
      summary: '这是一个测试报告，用于验证飞书API集成是否正常工作。',
      supportRate: 75,
      opposeRate: 15,
      tags: ['测试', '政策', 'API'],
      comments: [
        {
          role: '测试角色',
          score: 4,
          comment: '这是一条测试评论，用于验证飞书文档内容生成功能。'
        }
      ],
      generatedAt: new Date()
    };
    
    const result = await feishuClient.createDocument(mockReport);
    console.log('✅ 文档创建成功:', result);
    
    console.log('🎉 飞书API测试完成，所有功能正常！');
    
  } catch (error) {
    console.error('❌ 飞书API测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

// 运行测试
testFeishuAPI(); 