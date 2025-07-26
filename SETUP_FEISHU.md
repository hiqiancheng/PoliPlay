# 飞书功能快速设置指南

## 1. 环境变量配置

### 复制环境变量模板

**PowerShell (Windows)**:
```powershell
cd backend
Copy-Item env.example .env
```

**Bash (Linux/Mac)**:
```bash
cd backend
cp env.example .env
```

### 配置飞书信息
编辑 `backend/.env` 文件，确保包含以下配置：

```bash
# 飞书API配置
FEISHU_APP_ID=cli_a80e68a000d8d00e
FEISHU_APP_SECRET=KjHxXvVp0nvrnL3GkZNgBHB2BhXTfX3E
FEISHU_API_URL=https://open.feishu.cn/open-apis
```

### 快速验证配置
运行简化测试来验证配置：
```powershell
cd backend
node test-feishu-simple.js
```

## 2. 数据库迁移

运行数据库迁移脚本，添加飞书相关字段：

```bash
cd backend
node migrate-database.js
```

## 3. 测试飞书API

验证配置是否正确：

```bash
cd backend
node test-feishu-api.js
```

如果看到以下输出，说明配置成功：
```
开始测试飞书API...
1. 测试获取访问令牌...
✅ 访问令牌获取成功: t-xxxxxxxxxxxxxxxx...
2. 测试创建文档...
✅ 文档创建成功: { success: true, url: '...', documentId: '...' }
🎉 飞书API测试完成，所有功能正常！
```

## 4. 启动服务

```bash
# 启动后端服务
cd backend
npm start

# 启动前端服务
cd frontend
npm run dev
```

## 5. 使用功能

1. 在前端创建一个政策分析报告
2. 在报告页面点击"导出到飞书"按钮
3. 系统会自动创建飞书文档并打开链接

## 安全提醒

- ✅ `.env` 文件已在 `.gitignore` 中，不会被提交到Git
- ✅ 敏感信息只存储在环境变量中
- ✅ 生产环境请使用独立的App ID和App Secret

## 故障排除

### 令牌获取失败
- 检查App ID和App Secret是否正确
- 确认网络连接正常
- 验证飞书应用状态

### 文档创建失败
- 确认应用具有文档创建权限
- 检查API返回的错误信息
- 查看后端日志详细信息 