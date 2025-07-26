const feishuClient = require('./utils/feishu-client');

async function testFormattedFeishuDocument() {
  try {
    console.log('🎨 测试改进后的飞书文档格式...');
    
    // 创建丰富的测试报告数据
    const testReport = {
      title: '《关于加强城市绿化建设的实施方案》政策分析报告',
      generatedAt: new Date(),
      summary: '本政策旨在通过增加城市绿化面积、改善生态环境质量，提升市民生活幸福感。政策涉及预算投入、土地规划、维护管理等多个方面，需要政府、企业、市民的共同参与。经过多角度分析，该政策整体获得积极评价，但在实施细节和资金来源方面存在一定争议。',
      supportRate: 72,
      opposeRate: 15,
      tags: ['环保政策', '城市规划', '民生工程', '可持续发展', '生态建设'],
      comments: [
        {
          role: '环保专家',
          score: 5,
          comment: '这项政策对改善城市生态环境具有重要意义，建议加大投入力度，确保政策的有效实施。绿化不仅能改善空气质量，还能提升城市形象。'
        },
        {
          role: '市民代表',
          score: 4,
          comment: '非常支持增加绿化面积，这能让我们的生活环境更美好。希望在实施过程中能多听取市民意见，选择合适的绿化植物。'
        },
        {
          role: '财政部门',
          score: 3,
          comment: '政策方向正确，但需要考虑财政承受能力。建议分阶段实施，优先在人口密集区域进行绿化改造。'
        },
        {
          role: '城市规划师',
          score: 4,
          comment: '从城市规划角度看，绿化建设应该与整体城市发展规划相结合，避免盲目建设。建议制定详细的实施计划。'
        },
        {
          role: '企业代表',
          score: 3,
          comment: '支持环保理念，但希望政府能提供相应的政策支持和激励措施，鼓励企业参与绿化建设。'
        },
        {
          role: '施工单位',
          score: 4,
          comment: '技术上完全可行，关键是要选择适合当地气候的植物品种，并建立完善的后续维护机制。'
        }
      ]
    };
    
    console.log('📋 测试数据概览:');
    console.log(`   标题: ${testReport.title}`);
    console.log(`   支持度: ${testReport.supportRate}%`);
    console.log(`   反对度: ${testReport.opposeRate}%`);
    console.log(`   中性态度: ${100 - testReport.supportRate - testReport.opposeRate}%`);
    console.log(`   评论数量: ${testReport.comments.length}条`);
    console.log(`   政策标签: ${testReport.tags.join(', ')}`);
    
    const avgScore = (testReport.comments.reduce((sum, comment) => sum + comment.score, 0) / testReport.comments.length).toFixed(1);
    console.log(`   综合评分: ${avgScore}/5.0`);
    
    console.log('\n🚀 开始创建飞书文档...');
    const result = await feishuClient.createDocument(testReport);
    
    if (result.success) {
      console.log('\n✅ 格式化飞书文档创建成功！');
      console.log('📄 文档访问链接:', result.url);
      console.log('🆔 文档ID:', result.documentId);
      
      console.log('\n📊 文档包含以下格式化内容:');
      console.log('   ✓ 加粗彩色标题');
      console.log('   ✓ 执行摘要章节');
      console.log('   ✓ 民意分析统计图表');
      console.log('   ✓ 彩色政策标签');
      console.log('   ✓ 详细分析和影响评估');
      console.log('   ✓ 星级评分角色意见');
      console.log('   ✓ 智能结论建议');
      console.log('   ✓ 专业报告布局');
      
      console.log('\n🎉 请访问上述链接查看完整的格式化文档！');
    } else {
      console.log('\n❌ 文档创建失败');
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    
    if (error.response) {
      console.error('\n📊 错误详情:');
      console.error('   HTTP状态:', error.response.status);
      console.error('   错误数据:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.error('\n🔧 请检查:');
    console.error('   1. 飞书应用权限设置');
    console.error('   2. 网络连接状态');  
    console.error('   3. API密钥配置');
  }
}

console.log('🎨 飞书文档格式化测试');
console.log('=' * 60);
testFormattedFeishuDocument(); 