require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// 导入路由
const policyRoutes = require('./routes/policy');
const policyModel = require('./models/policy');

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API路由
app.use('/api/policy', policyRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '策弈台API服务正常运行' });
});

// 处理404错误
app.use((req, res, next) => {
  res.status(404).json({ error: '未找到请求的资源' });
});

// 处理其他错误
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`策弈台API服务已启动，监听端口: ${PORT}`);
});

policyModel.initTables().then(() => {
  console.log('数据库表已初始化');
}).catch(console.error); 