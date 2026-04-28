# COMP6080 Final 押题训练题（Vite + React + TypeScript）

- 左侧侧边栏：两个分组 **Game1 / Game2**
- 二级菜单：每组 10 道题
- 右侧主区域：题面摘要 + 考点标签 + 核心演示组件

## 启动

```bash
npm install
npm run dev
```

## 登录 / 注册（Vercel KV）

- 前端路由：`/login`、`/register`
- API（Vercel Serverless Functions）：
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- 存储：
  - `user:{username}`：用户信息（含 scrypt 加盐哈希密码）
  - `sess:{token}`：会话（带 TTL）

## 部署到 Vercel

- 本仓库包含 [vercel.json](file:///workspace/vercel.json)：
  - 开启 `api/**/*.ts` 的 Node Runtime
  - 为 SPA 配置重写：除 `/api/*` 与静态文件外，其他路径回落到 `index.html`
- 使用 Vercel KV：
  - 在 Vercel 控制台创建 KV 数据库，并绑定到当前项目
  - 绑定后会自动注入环境变量（无需提交到仓库）：`KV_REST_API_URL`、`KV_REST_API_TOKEN` 等

## KV 环境变量（本地 / CI）

- 本项目后端仅依赖 `@vercel/kv`，需要的最小环境变量是：
  - `KV_REST_API_URL`：形如 `https://xxxx.upstash.io`
  - `KV_REST_API_TOKEN`：可读写 token
  - `KV_REST_API_READ_ONLY_TOKEN`：可选，仅在你希望只读访问时使用
- 注意：`KV_REST_API_URL` 不要包含反引号（`` ` ``）；`.env` 文件中一般也不需要额外的引号
- 参考 [/.env.example](file:///workspace/.env.example)；不要把真实 token 提交到仓库
- `KV_URL` / `REDIS_URL` 在当前代码中不会被使用（除非你后续改为 Redis 客户端直连）

## 本地联调（可选）

- 仅 `npm run dev` 会启动 Vite 前端，`/api/*` 在本地不会生效
- 如需本地同时跑前端 + Vercel Functions + KV 环境变量，推荐用 Vercel CLI：

```bash
npm i -g vercel
vercel dev
```

## 结构

```
src/
  components/      # Layout + Sidebar（左右布局）
  pages/           # 首页 + 题目页（路由）
  questions/       # game1.tsx / game2.tsx（20 个演示组件 + 元数据）
  lib/utils.ts     # random / shuffle / localStorage helpers
```
