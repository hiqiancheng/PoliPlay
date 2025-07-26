const db = require('./utils/db');

async function migrateDatabase() {
  try {
    console.log('开始数据库迁移...');
    
    // 检查 policy 表是否存在 background 字段
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'policy' 
      AND COLUMN_NAME = 'background'
    `);
    
    if (columns.length === 0) {
      console.log('添加 background 字段到 policy 表...');
      await db.query(`
        ALTER TABLE policy 
        ADD COLUMN background TEXT AFTER content
      `);
      console.log('✅ background 字段添加成功');
    } else {
      console.log('✅ background 字段已存在，跳过迁移');
    }
    
    console.log('数据库迁移完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    process.exit(1);
  }
}

migrateDatabase(); 