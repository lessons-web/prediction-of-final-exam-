# COMP6080 Final 押题训练场（Vite + React + TypeScript）

这是一个“押题班配套训练工程”：
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

## 用于授课/录视频的建议
- 每题都包含一个“核心 Demo”，可以直接在对应组件里加注释、加断点或加 TODO 作为课堂演示。
- 你要做作业包的话：把 `questions/` 中的 Demo 改成只留 UI 框架，把逻辑留给学生补全即可。
