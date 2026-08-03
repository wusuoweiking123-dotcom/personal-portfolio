#!/usr/bin/env python3
"""Seed the portfolio agent with public project knowledge."""

from __future__ import annotations

import json
import time
import uuid
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "personal-rag-agent" / "data" / "docs.json"


def read_text(path: str, limit: int | None = None) -> str:
    file_path = ROOT / path
    if not file_path.exists():
        return f"本地材料暂未找到：{path}"
    text = file_path.read_text(encoding="utf-8", errors="ignore")
    return text[:limit] if limit else text


SEED_DOCS = [
    {
        "title": "个人网站公开信息：王忆航作品集与研究定位",
        "content": """王忆航是西交利物浦大学金融数学本科生，大二下均分 91.2，年级前三。核心方向包括 Agent 工程与 RAG、LLM 应用开发、Python / 全栈工程、深度学习、随机过程与计算金融、统计学习与资产定价。

个人网站的定位是金融数学研究生申请主页和 AI/Agent 项目作品集，核心叙事是：用数学描述不确定性，用模型连接真实世界。网站展示研究项目、实习经历、技能工具箱、获奖证书和个人 AI 知识库智能体。

当访客询问王忆航适合什么方向、为什么选择金融数学、项目之间有什么联系时，回答应围绕：金融实践提供真实问题，数学和机器学习提供建模工具，Agent/RAG 项目体现工程落地能力，项目集中在风险、定价、预测、可解释性和知识系统构建。""",
    },
    {
        "title": "最新简历摘要：教育、实习、技能与证书",
        "content": """王忆航，西交利物浦大学金融数学学士在读，2024.08-2028.07，大二下均分 91.2，年级前三。GitHub: https://github.com/wusuoweiking123-dotcom。核心方向：Agent 工程与 RAG、LLM 应用开发、Python / 全栈工程、深度学习。

荣誉与竞赛包括：校级创新创业大赛三等奖；“信浦杯”模拟炒股一等奖；“外研社杯”英语演讲浙江省一等奖；中信证券“最佳飞鹰”及“优秀实习生”。

实习经历包括：拓尔思智能大模型应用开发实习项目（2026.07.15-2026.08.14，项目实习生），实践 LLM 结构与训练逻辑、基座模型调用、Prompt Engineering、RAG、ReAct / ToT / SC 推理、离线部署、Coze Agent 工作流、MCP、后端 API 与外部工具调用，并参与需求文档、技术路线、原型测试和项目汇报。中信证券苏州分公司金融实习生（2025.01-2025.02），基于客户财务数据与交易行为搭建四维画像，使用聚类识别风险偏好；独立搭建量化模拟账户并回测行业指数，形成投资组合风险收益分析。

技能包括：Llama3 / Ollama、RAG、Embedding、Prompt Engineering、Agent Router、Coze、MCP、OCR、Streamlit；Python（NumPy / SciPy / Pandas）、PyTorch、SQL / SQLite、REST API、Docker / n8n、JavaScript / TypeScript、Next.js；CNN、迁移学习、LightGBM、随机森林、时间序列评估、LMM、Bootstrap、蒙特卡洛模拟。基金从业资格证已通过；CFA Level I 计划于 2026.08.20 参加考试。""",
    },
    {
        "title": "项目：校园智能图书馆 Agent（本地 RAG 知识库）",
        "content": """校园智能图书馆 Agent 是王忆航作为核心开发者推进的本地 RAG 知识库项目，时间为 2026.06 至今。项目面向校内学生学习资料场景，以 Streamlit + 本地 Llama3 构建交互与问答，支持 PDF、PPT、Word、Excel、CSV、Python、Notebook 等文件解析，支持压缩包安全解压及受限目录内语义分类。

RAG 与检索方面，项目通过 Ollama nomic-embed-text 完成 Chunk Embedding，以 SQLite 存储向量与元数据并实现余弦检索；设计 file_manifest 增量索引流程，减少重复 OCR 与 Embedding。路由与可解释性方面，设计 library / python / hybrid 三类问题路由与 Retrieved Context 溯源；接入波动率、历史 VaR、Expected Shortfall 与 GARCH proxy 等计算工具。可靠性与交付方面，加入 PyMuPDF + RapidOCR / PaddleOCR 回退，修复扫描 PDF 与整页 PPT 识别；实现密码登录、本地文件管理及局域网部署，并编写 35 页使用与调试教程。

王忆航对这个项目的理解是：RAG 应用的关键不只是接入大模型，而是把文件解析、索引更新、检索召回、问题路由、来源解释和部署维护做成可靠流程。""",
    },
    {
        "title": "项目：个人作品集网站与 RAG Agent",
        "content": """个人作品集网站与 RAG Agent 是王忆航 2026.07 至今独立开发的项目。项目搭建个人项目展示网站并嵌入作品集问答助手，支持资料入库、本地 TF-IDF 检索、OpenAI-compatible 模型回答与来源展示；提供 REST API、Docker / n8n 接口，帮助访客理解项目方法与个人贡献。

该项目的目标是把个人简历、项目经历、GitHub 成果、研究笔记和申请材料转化为可对话的智能体。访客可以问：王忆航做过哪些 Agent 项目？A 股 CNN 项目有什么创新？国债期货 CNN 如何避免合约切换噪声？银屑病研究的医学价值和限制是什么？回答应优先基于知识库片段，说明研究问题、方法、个人贡献、局限性和成果入口。

公开部署采用静态网站 + 受保护后端的方式：GitHub Pages 承载前端，Render/Railway/Fly 等平台承载后端和模型 API Key。访客只开放聊天，不开放资料入库和删除，避免知识库被陌生人修改。""",
    },
    {
        "title": "项目：CNN-Based Asset Pricing with Financial Price Images",
        "content": """关键词：CNN 资产定价、资产定价、金融价格图像、A 股、OHLCV、价格图像、PyTorch、横截面选股。

这个项目研究的问题是：CNN 能否从 OHLCV 价格图像中学习具有经济意义的短期形态，并在横截面选股、组合排序和风险调整后产生可检验的收益预测能力。

王忆航自己的理解是：这个项目不是简单把金融数据“图像化”追求模型炫技，而是在检验非结构化表示是否能补充传统人工因子。项目的核心价值在于把价格形态、机器学习和资产定价评估连接起来，并用 Rank IC、ICIR、H-L 收益、Sharpe、换手率、回撤和因子回归来判断信号是否具有经济意义。

最新进展：项目将 5 / 20 / 60 日 OHLCV 转为灰度矩阵，使用 PyTorch 训练多尺度 CNN 并完成 5 次集成、跨窗口迁移、横截面排序、IC / 因子回归及含交易成本回测。在 66 周可实现性评估中采用下一交易日开盘买入并扣除单边万三费率，固定候选策略后半段 Sharpe 为 2.26（33 周，持续前向验证）；研究已由周频推进至高频交易版本。

"""
        + read_text("cnn-price-images-a-share/docs/PROJECT_SUMMARY_CN.md"),
    },
    {
        "title": "项目：中金所国债期货 CNN 期限结构研究",
        "content": """中金所国债期货 CNN 期限结构研究是王忆航 2026.07 至今推进的项目开发。项目将股票价格图像 CNN 迁移至 TF / T / TS / TL，构建 t+0 / t+1 / t+2 连续期限面板和真实展期收益，避免跨合约价格直接相除造成机械跳变。

实验设计包括：搭建 1 / 5 / 20 日多尺度 CNN 与 3-12 通道扩展方案，采用时间顺序切分、purge 与样本外买入日期排序；GPU 训练和稳定性检验持续推进中。

"""
        + read_text("cffex-treasury-cnn-gpu-package/国债期货CNN_5d20d60d_完整实验过程记录.md", limit=14000),
    },
    {
        "title": "项目：AI-based prediction of local psoriasis lesion progression",
        "content": read_text("psoriasis_lesion_expansion_research_package.md", limit=16000),
    },
    {
        "title": "项目：银屑病 AI 第一阶段文献与工作流",
        "content": read_text("psoriasis_ai_stage1_workflow_and_literature_review.md", limit=16000),
    },
    {
        "title": "项目：CTMC Approximation for Stochastic Financial Modeling",
        "content": """CTMC Approximation for Stochastic Financial Modeling 研究连续时间马尔可夫链近似在扩散、跳扩散过程与衍生品定价中的数值应用。项目重点包括状态空间离散化、生成矩阵构建、参数估计和可计算定价框架。这个项目体现王忆航对随机过程、数值方法和金融衍生品定价的兴趣，也与其研究生阶段希望深化的随机微分方程、数值 PDE、蒙特卡洛方法方向一致。""",
    },
    {
        "title": "项目：2026 MCM ICM 评判机制稳健性",
        "content": """2026 MCM/ICM 项目关注 DWTS 评分机制中隐蔽投票不可观测、规则变化影响公平性的问题。王忆航作为核心建模成员，参与构建 HP-MBRF 混合建模框架，融合线性/整数规划、随机森林、最大熵原则与 Bootstrap。项目使用 LMM 与 LightGBM 分析多维因素和非线性关系，并通过蒙特卡洛路径迭代、截断对数正态分布和多目标优化评估不确定性和机制稳健性。""",
    },
    {
        "title": "项目：智能光疗解决方案创新项目",
        "content": """智能光疗解决方案创新项目围绕头癣治疗场景，包含需求分析、市场调研、商业计划书和项目可行性分析。项目获江苏省大学生创新训练计划省级立项及 6000 元资金支持。王忆航负责产品方案与商业化问题分析，参与专利申请材料准备，体现跨学科信息整合、商业表达和项目推进能力。成果展示网页位于 zhizhao-light-therapy/index.html。""",
    },
    {
        "title": "GitHub 与成果入口",
        "content": """网站目前使用 GitHub 主页 https://github.com/wusuoweiking123-dotcom 作为公开代码入口。已在项目详情中挂载的成果包括：CNN 资产定价项目完整报告、cnn-price-images-a-share 本地 README 和中文项目说明；中金所国债期货 CNN 期限结构研究的 README、研究笔记和 GPU 运行说明；银屑病研究包 Markdown、10 天交互式研究计划和文献矩阵 Excel。

如果访客询问具体 GitHub 仓库地址，而知识库没有项目级 repo URL，应如实说明目前公开入口是 GitHub 主页，项目级仓库 URL 需要后续补充，不要编造。""",
    },
]


def main() -> None:
    now = int(time.time() * 1000)
    docs = [
        {
            "id": uuid.uuid4().hex,
            "title": doc["title"],
            "content": doc["content"],
            "created_at": now + index,
        }
        for index, doc in enumerate(SEED_DOCS)
    ]
    DATA_FILE.parent.mkdir(exist_ok=True)
    DATA_FILE.write_text(json.dumps(docs, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Seeded {len(docs)} docs into {DATA_FILE}")


if __name__ == "__main__":
    main()
