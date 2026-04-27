# 项目规范

## 代码质量

### ESLint + Prettier

项目使用 ESLint 和 Prettier 保证代码风格一致。

**命令：**
```bash
npm run lint        # 检查代码问题
npm run lint:fix    # 自动修复 ESLint 可修复问题
npm run format      # Prettier 格式化代码
```

**配置：**
- `eslint.config.js` - ESLint v9 flat config
- `.prettierrc` - Prettier 配置

**规则要点：**
- 使用单引号 `''`
- 语句末尾加分号
- 缩进 2 空格
- 行宽 100 字符
- 箭头函数参数尽量不加括号

---

## React 组件规范

### 组件结构

```jsx
// 1. 导入
import { useState, useEffect } from 'react'

// 2. 组件定义
function ComponentName({ prop1, prop2 }) {
  // 3. Hooks
  const [state, setState] = useState()

  // 4. 副作用
  useEffect(() => {
    // ...
  }, [])

  // 5. 事件处理函数
  const handleClick = () => {
    // ...
  }

  // 6. 辅助函数
  const formatData = () => {
    // ...
  }

  // 7. 渲染
  return (
    <div>
      {/* JSX */}
    </div>
  )
}

export default ComponentName
```

### 组件命名
- 使用 PascalCase：`DictationMode`, `ConfirmDialog`
- 组件文件与组件名一致：`DictationMode.jsx`
- 布尔属性加 is/has/can 前缀：`isLoading`, `hasError`

### Hooks 规范
- Hooks 放在组件顶部
- 条件语句中不使用 Hooks
- 依赖数组完整填写

---

## 文件组织

```
src/
├── App.jsx              # 主应用
├── main.jsx             # React 入口
├── index.css            # 全局样式（TailwindCSS）
├── components/          # UI 组件
│   ├── BrushMode.jsx     # 刷题模式
│   ├── CompareMode.jsx   # 对照模式
│   ├── ConfirmDialog.jsx # 确认对话框
│   ├── DictationMode.jsx # 默写模式
│   ├── Header.jsx        # 头部（题目信息、选择器）
│   ├── LearnMode.jsx     # 学习模式
│   ├── ManageMode.jsx    # 材料管理
│   ├── ModeToggle.jsx    # 模式切换
│   ├── PracticeMode.jsx  # 练习模式
│   ├── Settings.jsx      # 设置页面
│   └── WrongNoteBook.jsx # 错题本
├── utils/               # 工具函数
│   ├── answerChecker.js  # 答案检查逻辑
│   ├── hintGenerator.js  # 提示生成逻辑
│   └── wrongNotes.js     # 错题本工具
├── services/            # 外部服务
│   ├── ai.js            # AI 翻译 API
│   └── api.js           # 后端 API 封装
└── data/
    └── db.json          # 默认题库数据
```

**模式说明：**
- **学习模式 (LearnMode)**：看中文 → AI 讲解 → 理解记忆
- **练习模式 (PracticeMode)**：看中文 → 手敲英文 → 即时反馈 → 获取渐进式提示
- **刷题模式 (BrushMode)**：看中文 → 快速作答 → 对错标记 → 无停留进入下一题
- **对照模式 (CompareMode)**：中英文对照展示 → 可隐藏英文练习 → 对照检查

**说明：**
- 组件按功能模块拆分
- 工具函数独立存放便于复用
- 单一职责：功能内聚，便于维护

---

## 命名规范

### 变量和函数
- 使用 camelCase：`handleClick`, `userInput`
- 布尔变量加前缀：`is`, `has`, `can`
- 事件处理加 `handle` 前缀：`handleSubmit`, `handleChange`

### 常量
- 使用 UPPER_SNAKE_CASE：`STORAGE_KEY`, `MAX_COUNT`

### CSS 类名
- 使用 TailwindCSS 工具类
- 避免自定义 CSS，需要时使用 `className`

---

## 数据处理

### localStorage
- 仅用于浏览器端缓存（如主题偏好）
- 存储键名定义在文件顶部常量
- 存储数据结构为 JSON

### SQLite 数据库
- 所有用户数据保存在 SQLite 数据库中（`backend/cn2en.db`）
- 通过 FastAPI 后端 API 访问
- 使用 aiosqlite 实现异步操作

### 数据校验
- 用户输入需要 `trim()` 处理
- 必填字段需判断空字符串
- 使用 `try-catch` 处理 JSON.parse 和 API 请求错误

---

## 错误处理

### try-catch
```javascript
try {
  setItems(JSON.parse(saved))
} catch {
  setItems(shuffleArray(dbData))
}
```

### 条件判断
- 使用早期返回减少嵌套
- 条件表达式简洁清晰

---

## 状态管理

- 使用 React useState 管理本地状态
- 状态提升至父组件共享
- 避免不必要的状态
- 复合状态合并管理

---

## Git 提交信息

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试
chore: 构建/工具
```

---

## 开发命令

```bash
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run preview  # 预览构建
npm run lint     # 代码检查
npm run format   # 代码格式化
```
