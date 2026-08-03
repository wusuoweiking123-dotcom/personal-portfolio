# 作品集智能体配置说明

这个智能体已经嵌入到个人网站 `index.html#agent`，它的定位不是通用聊天，而是“王忆航作品集问答助手”。

## 1. 接入大模型

你不需要浏览器插件，需要的是一个兼容 OpenAI Chat Completions 的模型 API Key。Kimi、OpenAI、DeepSeek、通义等都可以。

复制配置文件：

```bash
cd /Users/camellia/Documents/Codex/personal-rag-agent
cp .env.example .env
```

编辑 `.env`。例如 OpenAI：

```bash
OPENAI_API_KEY=你的_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

Kimi 示例：

```bash
OPENAI_API_KEY=你的_kimi_key
OPENAI_BASE_URL=https://api.moonshot.cn/v1
OPENAI_MODEL=moonshot-v1-8k
```

然后重启：

```bash
./start.sh
```

## 2. 把作品集资料写入知识库

```bash
python3 seed_portfolio_knowledge.py
```

这个脚本会把个人网站叙事、CNN 资产定价、国债现券/期货 CNN、银屑病 AI、CTMC、MCM、智能光疗等材料写入 `data/docs.json`。

## 3. 访客能问什么

- 你的 CNN 资产定价项目到底做了什么？
- 国债期货 CNN 和 A 股价格图像 CNN 有什么区别？
- 银屑病 AI 项目的研究空白在哪里？
- 你在项目里的个人贡献是什么？
- 哪个项目最能体现你适合金融数学？
- 你的 GitHub 里有哪些成果可以看？

## 4. 关于真实访客访问

现在这个版本适合本机展示：个人网站是 `file://`，智能体后端是 `http://127.0.0.1:8765`。

如果要让互联网上的访客使用，必须把后端部署到服务器或云平台，并把前端的 `agentApiBase` 改成公网 HTTPS 地址。不要把模型 API Key 写进前端网页。
