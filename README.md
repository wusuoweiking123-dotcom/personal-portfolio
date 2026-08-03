# 王忆航｜金融数学申请主页

这是一个无需构建工具的静态个人主页，已根据原简历重新组织为金融数学研究生申请叙事。

## 本地查看

直接打开 `index.html`，或在当前目录运行：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 修改内容

- 页面内容：`index.html`
- 视觉样式：`styles.css`
- 导航与滚动动画：`script.js`
- 作品集智能体后端：`personal-rag-agent/`

银屑病项目当前标记为“进行中”，只描述研究问题与方法框架，未写入未经确认的数据来源、实验结果或医学结论。

## AI 智能体与 GitHub 联动

个人网站已新增 `AI 智能体` 区块，可在 `index.html#agent` 直接访问。智能体后端在本地运行：

```bash
cd /Users/camellia/Documents/Codex/personal-rag-agent
./start.sh
```

作品集知识库初始化：

```bash
python3 seed_portfolio_knowledge.py
```

模型 API、Kimi/OpenAI-compatible 配置和真实访客部署说明见：

```text
personal-rag-agent/PORTFOLIO_AGENT_SETUP.md
```

## 绑定作品与证明材料

项目、实习、获奖与证书模块均可点击打开详情。收到材料链接后，在 `script.js` 的 `detailContent` 对应项目中填写 `materials` 数组即可显示一个或多个材料按钮。

待补充材料及建议优先级详见 `MATERIALS_NEEDED.md`。
