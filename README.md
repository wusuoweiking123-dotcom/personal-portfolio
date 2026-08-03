# 王忆航个人网站公开版

这是可直接用于 GitHub Pages / Netlify / Vercel 的静态公开网站包。

## 发布到 GitHub Pages

1. 在 GitHub 新建仓库，例如 `personal-portfolio`。
2. 上传本文件夹里的所有内容，不要只上传文件夹本身。
3. 进入仓库 `Settings` -> `Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main`，Folder 选择 `/root`。
6. 保存后等待 1-3 分钟，GitHub 会生成公开网址。

## AI 智能体说明

当前公开版不会调用 `127.0.0.1`。如果没有公网 Agent 后端，页面会显示“AI 问答即将开放”。

部署公网后端后，在 `script.js` 中配置：

```js
window.PORTFOLIO_AGENT_API_BASE = 'https://your-agent-backend.example.com';
```

或者直接修改：

```js
const agentApiBase = 'https://your-agent-backend.example.com';
```
