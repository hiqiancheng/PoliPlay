# PoliPlay 后端服务

策弈台 - 政策决策Agent沙盒系统后端服务

## 功能特性

- 政策内容分析（基于Dify AI）
- 政策分析报告生成
- 飞书文档导出
- RESTful API接口

## 技术栈

- Node.js
- Express.js
- Dify AI API
- 飞书API

## 安装和配置

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制环境变量示例文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置以下参数：

```env
# 服务器配置
PORT=5000
NODE_ENV=development

# Dify AI API配置
AI_API_KEY=your_dify_api_key_here
AI_API_URL=https://api.dify.ai/v1

# 飞书API配置（可选）
FEISHU_APP_ID=your_feishu_app_id_here
FEISHU_APP_SECRET=your_feishu_app_secret_here
FEISHU_API_URL=https://open.feishu.cn/open-apis
```

### 3. 获取Dify AI API密钥

1. 访问 [Dify AI](https://dify.ai) 平台
2. 创建或选择一个应用
3. 在应用设置中获取API密钥
4. 将API密钥配置到 `AI_API_KEY` 环境变量中

## 运行服务

### 开发模式

```bash
npm run dev
```

### 生产模式

```bash
npm start
```

服务将在 `http://localhost:5000` 启动

## API接口

### 1. 政策分析接口

**POST** `/api/policy/analyze`

分析政策内容，获取主题总结和细化问题。

**请求体：**
```json
{
  "title": "政策标题",
  "content": "政策内容"
}
```

**响应：**
```json
{
  "summary": "政策主题总结",
  "questions": [
    {
      "id": 1,
      "type": "text",
      "title": "问题标题",
      "placeholder": "占位符文本",
      "answer": ""
    }
  ]
}
```

### 2. 政策报告生成接口

**POST** `/api/policy/report`

基于政策信息和问题回答生成分析报告。

**请求体：**
```json
{
  "title": "政策标题",
  "content": "政策内容",
  "analysis": {
    "questions": [
      {
        "id": 1,
        "title": "问题标题",
        "answer": "问题回答"
      }
    ]
  }
}
```

**响应：**
```json
{
  "id": "报告ID",
  "policyId": "政策ID",
  "title": "报告标题",
  "summary": "政策总结",
  "supportRate": 75,
  "opposeRate": 15,
  "tags": ["标签1", "标签2"],
  "wordCloud": [
    {"text": "关键词", "weight": 100}
  ],
  "analysisHtml": "<h4>标题</h4><p>内容</p>",
  "generatedAt": "2023-12-01T10:00:00.000Z"
}
```

### 3. 获取政策详情

**GET** `/api/policy/:id`

获取指定政策的详细信息。

### 4. 获取政策报告

**GET** `/api/policy/report/:id`

获取指定政策报告的详细信息。

### 5. 导出到飞书

**POST** `/api/policy/export-feishu`

将政策报告导出到飞书文档。

**请求体：**
```json
{
  "reportId": "报告ID"
}
```

## Dify AI集成说明

本系统使用Dify AI的聊天消息API进行政策分析：

- **API端点：** `https://api.dify.ai/v1/chat-messages`
- **认证方式：** Bearer Token
- **响应模式：** blocking（阻塞模式）
- **用户标识：** policy-analyzer

### 支持的查询类型

1. **政策分析查询：** 分析政策内容，生成主题总结和细化问题
2. **报告生成查询：** 基于政策信息和问题回答生成详细分析报告

### 错误处理

- API调用失败时会自动回退到模拟数据
- 支持JSON解析失败的处理
- 提供详细的错误日志

## 开发说明

### 项目结构

```
backend/
├── controllers/     # 控制器层
├── services/        # 服务层
├── utils/          # 工具类
│   ├── ai-client.js    # Dify AI客户端
│   ├── feishu-client.js # 飞书客户端
│   └── config.js       # 配置管理
├── routes/         # 路由定义
├── server.js       # 服务器入口
└── package.json    # 项目配置
```

### 扩展开发

如需添加新的AI功能，可以：

1. 在 `utils/ai-client.js` 中添加新的方法
2. 在 `services/policy.js` 中调用新方法
3. 在 `controllers/policy.js` 中添加新的控制器方法
4. 在 `routes/policy.js` 中添加新的路由

## 注意事项

1. 确保Dify AI API密钥的安全性，不要提交到版本控制系统
2. 生产环境建议使用HTTPS
3. 定期检查API使用量和配额
4. 监控API响应时间和错误率 