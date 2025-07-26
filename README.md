# 策弈台 (PoliPlay)

策弈台是一个政策决策Agent沙盒系统，旨在辅助政策制定和分析。

## 项目简介

策弈台允许用户输入政策内容，系统通过AI分析后提供决策分析报告，包括支持度、反对度、词云、标签等多维度分析，并生成完整的分析文档。

## 功能特点

- 多模态政策编辑器（支持文本和图片）
- 政策主题提取与细化问题引导
- AI决策分析与讨论
- 分析报告生成（支持导出为飞书文档）

## 技术架构

- 前端：Vue 3 + Element Plus
- 后端：Node.js
- 数据交互：RESTful API

## 项目结构

```
PoliPlay/
├── frontend/             # 前端Vue3项目
│   ├── public/           # 静态资源
│   └── src/              # 源代码
│       ├── assets/       # 资源文件
│       ├── components/   # 组件
│       ├── views/        # 页面
│       ├── router/       # 路由
│       ├── store/        # 状态管理
│       ├── api/          # API接口
│       └── utils/        # 工具函数
├── backend/              # 后端Node.js项目
│   ├── controllers/      # 控制器
│   ├── models/           # 数据模型
│   ├── routes/           # 路由
│   ├── services/         # 服务
│   └── utils/            # 工具函数
└── README.md             # 项目说明
```

## 接口设计

### 一号接口：政策主题提取与细化

- 输入：用户编辑的政策内容
- 输出：政策主题总结和细化选项问题

### 二号接口：决策分析

- 输入：完整的政策内容和背景信息
- 输出：决策分析报告（支持度、反对度、词云、标签等）

## 开发与部署

### 开发环境设置

```bash
# 前端
cd frontend
npm install
npm run dev

# 后端
cd backend
npm install
npm run dev
```

### 构建与部署

```bash
# 前端构建
cd frontend
npm run build

# 后端部署
cd backend
npm start
``` 