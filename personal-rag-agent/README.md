# 个人知识库智能体

这是一个能直接跑起来的本地 RAG Agent 雏形：上传文档、检索知识库、调用 OpenAI-compatible 模型回答，并带一个简单前端。

## 1. 直接运行

```bash
cd /Users/camellia/Documents/Codex/personal-rag-agent
python3 app.py
```

打开：

```text
http://127.0.0.1:8765
```

也可以直接运行：

```bash
./start.sh
```

在 macOS Finder 里也可以双击 `start.command` 启动。

如果浏览器显示 `ERR_CONNECTION_REFUSED`，说明服务没有启动。重新执行上面的启动命令，再刷新页面即可。

不配置 API Key 时，它会用本地检索摘要模式回答；配置模型后，会变成更自然的智能体回答。

## 2. 配置模型

```bash
cp .env.example .env
```

编辑 `.env`：

```bash
OPENAI_API_KEY=你的_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

如果你用 Kimi、DeepSeek、通义等兼容 OpenAI Chat Completions 的服务，改成对应的 `OPENAI_BASE_URL` 和模型名即可。

启动时加载 `.env`：

```bash
set -a
source .env
set +a
python3 app.py
```

## 3. 使用方法

1. 在右侧“文档管理”里粘贴资料，或导入 `.txt` / `.md` 文件。
2. 点击“加入知识库”。
3. 在左侧聊天区提问，例如：
   - 根据知识库，帮我写一份客户通话前简报
   - 总结这个产品的核心卖点和潜在风险
   - 把会议记录整理成行动清单
   - 从资料里提炼 5 个销售开场问题

## 4. 给 n8n 调用

后端提供了一个自动化入口：

```http
POST http://127.0.0.1:8765/api/agent/run
Content-Type: application/json

{
  "message": "根据知识库生成今天的客户跟进建议",
  "top_k": 5
}
```

返回：

```json
{
  "answer": "...",
  "sources": []
}
```

在 n8n 里用 HTTP Request 节点调用这个接口即可。

## 5. Docker 运行

如果你已经安装 Docker：

```bash
cd /Users/camellia/Documents/Codex/personal-rag-agent
cp .env.example .env
docker compose up --build
```

## 6. 后续升级路线

- 把当前本地 TF-IDF 检索替换为 Qdrant / Chroma / Milvus。
- 增加 PDF、Word、网页 URL 抓取。
- 增加多 Agent 工作流：研究员、总结员、销售话术员、质检员。
- 接入 n8n：定时抓取线索、自动生成简报、发到邮箱或飞书。
- 增加登录和权限，变成可部署给团队用的小产品。
