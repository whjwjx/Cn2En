# 🧠 Cn2En - 中译英智能学习平台

一个支持 AI 辅助、多种学习模式、渐进式提示的中译英默写练习工具。

![React](https://img.shields.io/badge/React-18.2-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ 功能

### 🎯 四种学习模式

| 模式 | 描述 | 适用场景 |
|------|------|----------|
| **学习模式** | 看中文 → AI 翻译生成 → 场景说明 → 词汇语法讲解 | 初次学习，深度理解 |
| **练习模式** | 看中文 → 手敲英文 → 即时反馈 → AI 分析 → 获取渐进式提示 | 巩固记忆，查漏补缺 |
| **刷题模式** | 看中文 → 快速作答 → 对错标记 → 自动下一题 | 大量练习，提升速度 |
| **管理模式** | 材料管理 + 错题本 + 设置 + AI 批量生成 | 管理内容，查看统计 |

### 🤖 AI 智能助手

- **智能翻译**：AI 自动生成地道英文翻译和场景说明
- **翻译优化**：对比当前翻译，给出更地道表达建议
- **错误分析**：智能分析翻译错误，提供语法点和记忆技巧
- **句子生成**：按主题批量生成中英文对照句子
- **中文覆盖分析**：逐词比对，标记正确/错误/遗漏部分

### 📊 学习数据追踪

- **错题本**：自动收集错题，支持标记和取消
- **每日统计**：追踪每日练习题数和正确率
- **学习进度**：标记已学材料，可视化学习进度
- **连击记录**：练习模式记录连续正确次数
- **计时功能**：记录每题作答时间

### 💡 渐进式提示系统

- **一级提示**：告知错误类别数量
- **二级提示**：提示具体错误类型
- **三级提示**：给出精确位置和正确答案
- **可视化对比**：用颜色标记正确、错误、遗漏部分

### 🔧 材料管理

- 添加、编辑、删除材料
- 批量导入（支持中文=英文格式）
- 批量删除选中项目
- AI 翻译辅助编辑
- **AI 场景导入**：输入主题（如"餐厅点餐"、"商务会议"），AI 自动生成相关中英文句子并导入

### 🎨 其他特性

- 🌙 深色模式支持
- ⌨️ 快捷键：
  - `Ctrl + Enter`：提交核对
  - `Enter`：获取提示
- 💾 数据导出/导入（JSON 格式）
- 📱 响应式设计
- 🚀 自动初始化默认题库

## 🛠️ 技术栈

### 前端
- **React 18.2** - UI 框架
- **Vite 5.1** - 构建工具
- **TailwindCSS 3.4** - CSS 框架

### 后端
- **FastAPI 0.115** - Web 框架
- **SQLAlchemy 2.0 + aiosqlite** - 异步 ORM 和数据库
- **Pydantic 2.10** - 数据验证

### AI 服务
- 支持 OpenAI 兼容 API（通过环境变量配置）
- 默认配置支持 MiniMax 等中文模型

## 🚀 快速开始

### 1. 配置环境变量

前端环境配置：

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，配置以下变量：
# VITE_API_URL=http://localhost:8000        # 后端 API 地址
# VITE_AI_API_KEY=your_api_key              # AI API 密钥（可选）
# VITE_AI_BASE_URL=https://api.example.com  # AI API 基础地址（可选）
# VITE_AI_MODEL=gpt-4                       # AI 模型名称（可选）
```

后端环境配置：

```bash
cd backend
cp .env.example .env

# 编辑 .env 文件，配置以下变量：
# DATABASE_URL=sqlite+aiosqlite:///./cn2en.db  # 数据库地址
```

### 2. 启动后端服务

```bash
# 进入后端目录
cd backend

# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动后端服务
python run.py
```

后端服务将在 http://localhost:8000 启动。
API 文档：http://localhost:8000/docs

### 3. 启动前端开发服务器

```bash
# 在项目根目录
npm install
npm run dev
```

访问 http://localhost:5173

## 📁 项目结构

```
.
├── src/                      # 前端源码
│   ├── App.jsx               # 主应用
│   ├── main.jsx              # React 入口
│   ├── index.css             # 全局样式
│   ├── components/           # UI 组件
│   │   ├── LearnMode.jsx     # 学习模式
│   │   ├── PracticeMode.jsx  # 练习模式
│   │   ├── BrushMode.jsx     # 刷题模式
│   │   ├── ManageMode.jsx    # 管理模式
│   │   ├── WrongNoteBook.jsx # 错题本
│   │   ├── Settings.jsx      # 设置页面
│   │   ├── Header.jsx        # 头部组件
│   │   ├── ModeToggle.jsx    # 模式切换
│   │   └── ConfirmDialog.jsx # 确认对话框
│   ├── services/             # API 调用层
│   │   ├── api.js            # 后端 API 封装
│   │   └── ai.js             # AI API 封装
│   ├── utils/                # 工具函数
│   │   ├── answerChecker.js  # 答案检查逻辑
│   │   ├── hintGenerator.js  # 提示生成逻辑
│   │   └── wrongNotes.js     # 错题本工具
│   └── data/
│       └── db.json           # 默认题库数据
├── backend/                  # 后端服务
│   ├── app/
│   │   ├── main.py           # FastAPI 应用入口
│   │   ├── database.py       # 数据库配置
│   │   ├── models.py         # 数据模型
│   │   ├── schemas.py        # Pydantic 验证模型
│   │   └── routers/          # API 路由
│   │       ├── items.py      # 题目 CRUD
│   │       ├── settings.py   # 设置管理
│   │       ├── wrong_notes.py# 错题本
│   │       ├── daily_stats.py# 每日统计
│   │       └── database.py   # 数据导入导出
│   ├── requirements.txt      # Python 依赖
│   ├── run.py                # 启动脚本
│   └── cn2en.db              # SQLite 数据库文件
├── .env.example              # 前端环境变量示例
└── .env                      # 前端环境变量
```

## 🗄️ 数据存储

所有用户数据保存在 SQLite 数据库中（`backend/cn2en.db`）。

### 数据库表

| 表名 | 说明 |
|------|------|
| **items** | 题目材料（中文、英文、学习状态等） |
| **settings** | 用户设置（主题、计时器、每日目标等） |
| **wrong_notes** | 错题本（关联到 items） |
| **daily_stats** | 每日统计（日期、练习数、正确数） |

### 数据迁移

如需备份或迁移数据：

```bash
# 导出数据（通过 API）
curl http://localhost:8000/api/database/export > backup.json

# 导入数据
curl -X POST http://localhost:8000/api/database/import \
  -H "Content-Type: application/json" \
  -d @backup.json
```

## 📡 API 文档

启动后端服务后访问：http://localhost:8000/docs

### 主要端点

**题目管理**
- `GET /api/items` - 获取题目列表（支持分页、筛选）
- `GET /api/items/count` - 获取题目总数
- `GET /api/items/{id}` - 获取单个题目
- `POST /api/items/` - 创建题目
- `PUT /api/items/{id}` - 更新题目
- `DELETE /api/items/{id}` - 删除题目
- `POST /api/items/bulk-delete` - 批量删除
- `POST /api/items/import` - 批量导入
- `POST /api/items/init-default` - 初始化默认题库

**设置管理**
- `GET /api/settings/` - 获取所有设置
- `GET /api/settings/{key}` - 获取单个设置
- `PUT /api/settings/{key}` - 更新设置
- `DELETE /api/settings/{key}` - 删除设置
- `DELETE /api/settings/all` - 删除所有设置

**错题本**
- `GET /api/wrong-notes/` - 获取所有错题
- `GET /api/wrong-notes/check/{item_id}` - 检查是否在错题本
- `POST /api/wrong-notes/{item_id}` - 添加到错题本
- `DELETE /api/wrong-notes/{item_id}` - 从错题本移除
- `DELETE /api/wrong-notes/all` - 清空错题本

**每日统计**
- `GET /api/daily-stats/` - 获取所有统计
- `GET /api/daily-stats/today` - 获取今日统计
- `GET /api/daily-stats/{date}` - 获取指定日期统计
- `PUT /api/daily-stats/update` - 更新今日统计

**数据管理**
- `GET /api/database/export` - 导出所有数据
- `POST /api/database/import` - 导入数据

**健康检查**
- `GET /api/health` - 服务状态检查

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Enter` | 提交核对（学习/练习/刷题模式） |

## 🔧 开发命令

```bash
# 前端
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run preview  # 预览构建
npm run lint     # 代码检查
npm run format   # 代码格式化

# 后端
cd backend
python run.py    # 启动开发服务器
```

## 📄 许可

MIT
