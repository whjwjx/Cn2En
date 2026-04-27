# 中译英默写练习

一个简洁的中译英默写练习工具，支持三种学习模式和渐进式提示。

## 功能

### 模式
- **默写模式**：中文提示 → 手写英文 → 提交核对 → 获取渐进式提示
- **对照模式**：中英文对照展示 → 可隐藏英文练习 → 对照检查
- **管理材料**：添加、编辑、删除、批量导入中英文材料

### 提示系统
- 一级提示：告知错误类别数量
- 二级提示：提示具体错误类型
- 三级提示：给出精确位置和正确答案

### 错误检查
- 标点符号错误
- 多余/缺少空格
- 漏了/多了单词
- 单词拼写/位置错误
- 句首字母大写

## 技术栈

### 前端
- React 18.2
- Vite 5.1
- TailwindCSS 3.4

### 后端
- FastAPI
- SQLite (via SQLAlchemy async)
- aiosqlite

## 快速开始

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt

# 启动后端服务
python run.py
```

后端服务将在 http://localhost:8000 启动。
API 文档：http://localhost:8000/docs

### 2. 启动前端开发服务器

```bash
# 在项目根目录
npm install
npm run dev
```

访问 http://localhost:5173

## 项目结构

```
.
├── src/                      # 前端源码
│   ├── App.jsx               # 主应用
│   ├── components/           # UI 组件
│   ├── services/             # API 调用层
│   │   └── api.js            # 后端 API 封装
│   ├── utils/                # 工具函数
│   └── data/
│       └── db.json           # 默认题库（首次启动时导入）
├── backend/                  # 后端服务
│   ├── app/
│   │   ├── main.py           # FastAPI 应用入口
│   │   ├── database.py       # 数据库配置
│   │   ├── models.py         # 数据模型
│   │   ├── schemas.py        # Pydantic 验证模型
│   │   └── routers/          # API 路由
│   │       ├── items.py      # 题目 CRUD
│   │       ├── settings.py   # 设置管理
│   │       ├── wrong_notes.py # 错题本
│   │       └── daily_stats.py # 每日统计
│   ├── requirements.txt      # Python 依赖
│   └── run.py                # 启动脚本
└── .env                      # 环境变量
```

## 数据存储

所有用户数据保存在 SQLite 数据库中（`backend/cn2en.db`）。

### 数据库表

- **items** - 题目材料
- **settings** - 用户设置
- **wrong_notes** - 错题本
- **daily_stats** - 每日统计

### 数据迁移

如需从旧版 localStorage 迁移数据：

```bash
cd backend
python migrate_from_localstorage.py
```

## API 文档

启动后端服务后访问：http://localhost:8000/docs

### 主要端点

- `GET /api/items` - 获取题目列表
- `POST /api/items` - 创建题目
- `PUT /api/items/{id}` - 更新题目
- `DELETE /api/items/{id}` - 删除题目
- `GET /api/settings` - 获取所有设置
- `PUT /api/settings/{key}` - 更新设置
- `GET /api/wrong-notes` - 获取错题本
- `POST /api/wrong-notes/{id}` - 添加错题
- `GET /api/daily-stats/today` - 获取今日统计
- `PUT /api/daily-stats/update` - 更新统计数据

## 快捷键

- `Ctrl + Enter`：提交核对（默写模式/对照模式）

## 开发命令

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

## 许可

MIT
