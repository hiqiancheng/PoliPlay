# PoliPlay 快速启动指南

## 🚀 快速开始

### 1. 环境准备

确保您的系统已安装：
- Node.js (版本 16 或更高)
- npm 或 yarn

### 2. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 配置 Dify AI API

#### 获取 API 密钥

1. 访问 [Dify AI](https://dify.ai) 平台
2. 注册并登录账户
3. 创建新应用或选择现有应用
4. 在应用设置中找到 API 密钥
5. 复制 API 密钥

#### 配置环境变量

```bash
# 在 backend 目录下
cp env.example .env
```

编辑 `.env` 文件：

```env
# Dify AI API配置
AI_API_KEY=your_actual_dify_api_key_here
AI_API_URL=https://api.dify.ai/v1

# 其他配置保持默认即可
PORT=5000
NODE_ENV=development
```

### 4. 测试 API 集成

```bash
# 在 backend 目录下
npm run test:api
```

如果看到类似以下输出，说明配置成功：

```
🧪 开始测试 Dify AI API 集成...

📋 测试政策分析功能...
✅ 政策分析成功！
📝 政策总结: 这是关于"关于促进新能源汽车发展的若干措施"的政策分析...
❓ 生成问题数量: 8
📋 问题示例: 该政策适用的地区范围是？

==================================================

📊 测试报告生成功能...
✅ 报告生成成功！
📝 报告总结: 《关于促进新能源汽车发展的若干措施》是一项重要的政策举措...
📊 支持率: 75%
📊 反对率: 15%
🏷️ 标签数量: 5
☁️ 词云数量: 14

==================================================

⚙️ 检查配置信息...
🔑 API密钥配置: ✅ 已配置
🌐 API地址: https://api.dify.ai/v1

🎉 测试完成！
```

### 5. 启动服务

#### 启动后端服务

```bash
# 在 backend 目录下
npm run dev
```

后端服务将在 `http://localhost:5000` 启动

#### 启动前端服务

```bash
# 在 frontend 目录下
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

### 6. 使用系统

1. 打开浏览器访问 `http://localhost:5173`
2. 输入政策标题和内容
3. 点击"分析政策"按钮
4. 回答生成的细化问题
5. 查看生成的政策分析报告

## 🔧 故障排除

### API 密钥问题

如果遇到 API 密钥相关错误：

1. 检查 `.env` 文件中的 `AI_API_KEY` 是否正确
2. 确认 API 密钥是否有效且未过期
3. 检查 Dify AI 应用是否处于激活状态

### 网络连接问题

如果遇到网络连接错误：

1. 检查网络连接是否正常
2. 确认防火墙设置是否允许访问 `api.dify.ai`
3. 尝试使用代理或 VPN

### 服务启动问题

如果服务无法启动：

1. 检查端口是否被占用
2. 确认 Node.js 版本是否符合要求
3. 检查依赖是否正确安装

## 📚 更多信息

- [后端 API 文档](./backend/README.md)
- [Dify AI 官方文档](https://docs.dify.ai/)
- [项目完整文档](./README.md)

## 🆘 获取帮助

如果遇到问题，请：

1. 查看控制台错误信息
2. 检查日志文件
3. 参考故障排除部分
4. 提交 Issue 到项目仓库 