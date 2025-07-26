# 飞书集成说明

## 概述

本项目集成了飞书开放平台的文档API，可以将政策分析报告自动导出到飞书文档中。

## 配置信息

### 环境变量配置

首先复制环境变量模板文件：
```bash
cp backend/env.example backend/.env
```

然后在`.env`文件中配置以下变量：

```bash
# 飞书API配置
FEISHU_APP_ID=cli_a80e68a000d8d00e
FEISHU_APP_SECRET=KjHxXvVp0nvrnL3GkZNgBHB2BhXTfX3E
FEISHU_API_URL=https://open.feishu.cn/open-apis
```

**注意**: 请确保`.env`文件已添加到`.gitignore`中，避免敏感信息泄露。

### 权限要求

确保飞书应用具有以下权限：
- `docx:document` - 创建和编辑文档
- `docx:document.create` - 创建文档
- `docx:document.write` - 写入文档内容

## 功能特性

### 1. 自动防重复
- 系统会检查报告是否已经导出过
- 如果已存在飞书文档，直接返回已有链接
- 避免重复创建文档

### 2. 完整内容导出
飞书文档将包含以下内容：
- 报告标题和生成时间
- 政策总结
- 支持度与反对度统计
- 政策标签
- 详细的角色意见记录

### 3. 格式化输出
- 标题使用24px加粗字体
- 章节标题使用18px加粗字体
- 正文使用14px标准字体
- 生成时间使用12px斜体字体

## 使用方法

### 1. 数据库迁移
首次使用前，运行数据库迁移脚本：
```bash
node backend/migrate-database.js
```

### 2. 测试API连接
验证飞书API配置是否正确：
```bash
node backend/test-feishu-api.js
```

### 3. 前端使用
在PolicyReport页面点击"导出到飞书"按钮即可自动创建文档。

## API流程

### 1. 获取访问令牌
```javascript
POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal
{
  "app_id": process.env.FEISHU_APP_ID,
  "app_secret": process.env.FEISHU_APP_SECRET
}
```

### 2. 创建文档
```javascript
POST https://open.feishu.cn/open-apis/docx/v1/documents
Authorization: Bearer {access_token}
{
  "title": "政策分析报告"
}
```

### 3. 插入内容
```javascript
POST https://open.feishu.cn/open-apis/docx/v1/documents/{document_id}/blocks/batch_update
Authorization: Bearer {access_token}
{
  "requests": [
    {
      "insert_paragraph": {
        "location": { "index": 0 },
        "paragraph": { "elements": [...] }
      }
    }
  ]
}
```

## 数据库结构

新增字段：
- `feishuDocUrl` - 飞书文档访问链接
- `feishuDocId` - 飞书文档ID

## 错误处理

系统会处理以下错误情况：
- App ID或App Secret错误
- 网络连接问题
- 飞书API限制
- 文档创建失败

所有错误都会在控制台输出详细日志，便于调试。

## 注意事项

1. **环境变量**: 所有敏感信息（App ID、App Secret）都通过环境变量配置，确保安全性
2. **令牌管理**: 飞书访问令牌有效期为2小时，系统会自动刷新
3. **API限制**: 为避免API限制，内容插入操作间隔100ms
4. **防重复**: 文档创建后会自动保存链接，避免重复创建
5. **安全性**: 确保`.env`文件已添加到`.gitignore`中，避免敏感信息泄露

## 故障排除

### 1. 令牌获取失败
- 检查App ID和App Secret是否正确
- 确认应用状态正常
- 检查网络连接

### 2. 文档创建失败
- 确认应用具有创建文档权限
- 检查文档标题是否合规
- 查看API返回的错误信息

### 3. 内容插入失败
- 确认文档ID有效
- 检查内容格式是否符合API要求
- 验证访问令牌是否过期 