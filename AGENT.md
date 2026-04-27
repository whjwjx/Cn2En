# Agent 指南

本项目是一个中译英默写练习工具，使用 React + Vite + TailwindCSS 构建。

## 技术栈

| 库 | 版本 | 用途 |
|----|------|------|
| React | 18.2.0 | UI 框架 |
| Vite | 5.1.4 | 构建工具 |
| TailwindCSS | 3.4.1 | 样式 |
| localStorage | - | 数据持久化 |

## 关键文件

| 文件 | 说明 |
|------|------|
| `src/App.jsx` | 主组件 |
| `src/components/*.jsx` | UI 组件（ConfirmDialog、ModeToggle、Header、DictationMode、CompareMode、ManageMode） |
| `src/utils/answerChecker.js` | 答案检查逻辑 |
| `src/utils/hintGenerator.js` | 提示生成逻辑 |
| `src/services/ai.js` | AI 翻译 API |
| `src/data/db.json` | 默认题库（10条示例） |
| `src/main.jsx` | React 入口 |
| `src/index.css` | TailwindCSS 入口 |

## 组件结构

```
App
├── ConfirmDialog      # components/ConfirmDialog.jsx
├── ModeToggle         # components/ModeToggle.jsx
├── Header             # components/Header.jsx
├── DictationMode      # components/DictationMode.jsx
│   ├── 题目展示区
│   ├── 文本输入框
│   ├── 提示区域（3级渐进）
│   └── 上一题/下一题
├── CompareMode        # components/CompareMode.jsx
│   ├── 中英文对照区
│   ├── 隐藏/显示答案
│   ├── 文本输入框
│   ├── 提示区域
│   └── 上一题/下一题
└── ManageMode         # components/ManageMode.jsx
    ├── 添加材料表单（支持 AI 翻译）
    ├── 批量导入表单
    ├── 材料列表（编辑/删除/批量选择）
    └── ConfirmDialog
```

## 核心函数

### checkAnswer(userText, standardText)
答案校验函数，返回 `{ isCorrect, errors, userText }`

**错误类型 (errors[].type)**:
| 类型 | 说明 |
|------|------|
| `punctuation` | 标点符号错误 |
| `space` | 多余空格 |
| `missing` | 漏了单词 |
| `extra` | 多了单词 |
| `wrong` | 单词位置/拼写错误 |
| `missingSpace` | 缺少空格 |
| `capitalization` | 大小写错误 |

### getHint(errors, standardWords)
生成渐进式提示，返回三级提示对象 `{ level1, level2, level3 }`

- Level 1：告知各类错误数量
- Level 2：提示具体错误类型
- Level 3：给出精确位置和正确答案

## 状态管理

使用 React useState/useEffect，无外部状态管理库。

**App 组件状态**:
- `mode`: 当前模式 ('dictation' | 'compare' | 'manage')
- `items`: 题库数组
- `currentIndex`: 当前题目索引
- `showList`: 题目选择器显示状态
- `confirmDialog`: 确认对话框状态

**持久化**: localStorage 键名 `cn2en_data`

## 样式规范

- 使用 TailwindCSS 工具类
- 颜色系统：gray(灰)、blue(蓝)、yellow(黄)、green(绿)、red(红)
- 圆角：rounded-lg / rounded-xl
- 间距：space-y-4, space-y-6, gap-4
- 响应式：md:grid-cols-2（对照模式中英文分栏）

## 开发命令

```bash
npm install    # 安装依赖
npm run dev    # 开发服务器（http://localhost:5173）
npm run build  # 生产构建
npm run preview # 预览生产构建
```
