const db = require('./utils/db');

async function migrateDatabase() {
  try {
    console.log('开始数据库迁移...');
    
    // 检查列是否已存在
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'report' 
      AND COLUMN_NAME IN ('feishuDocUrl', 'feishuDocId')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    if (!existingColumns.includes('feishuDocUrl')) {
      console.log('添加 feishuDocUrl 列...');
      await db.query(`
        ALTER TABLE report 
        ADD COLUMN feishuDocUrl VARCHAR(500) DEFAULT NULL
      `);
      console.log('✅ feishuDocUrl 列添加成功');
    } else {
      console.log('✅ feishuDocUrl 列已存在');
    }
    
    if (!existingColumns.includes('feishuDocId')) {
      console.log('添加 feishuDocId 列...');
      await db.query(`
        ALTER TABLE report 
        ADD COLUMN feishuDocId VARCHAR(64) DEFAULT NULL
      `);
      console.log('✅ feishuDocId 列添加成功');
    } else {
      console.log('✅ feishuDocId 列已存在');
    }
    
    console.log('🎉 数据库迁移完成！');
    
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error.message);
    console.error('详细错误:', error);
  }
}

// 运行迁移
migrateDatabase(); 