# COMP6080 Final 押题训练题（Vite + React + TypeScript）

- 左侧侧边栏：两个分组 **Game1 / Game2**
- 二级菜单：每组 10 道题
- 右侧主区域：题面摘要 + 考点标签 + 核心演示组件

## 启动

```bash
npm install
npm run dev
```

## 结构

```
src/
  components/      # Layout + Sidebar（左右布局）
  pages/           # 首页 + 题目页（路由）
  questions/       # game1.tsx / game2.tsx（20 个演示组件 + 元数据）
  lib/utils.ts     # random / shuffle / localStorage helpers
```
