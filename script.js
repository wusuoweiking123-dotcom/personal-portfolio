const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

const syncHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
  document.body.style.overflow = open ? '' : 'hidden';
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.getElementById('year').textContent = new Date().getFullYear();

// 将用户提供的作品、证书或证明材料链接填入 materials 数组即可。
const detailContent = {
  'video-intro': {
    kicker: 'Personal Introduction · Coming Soon',
    title: '个人视频介绍',
    paragraphs: ['预留给 2-3 分钟的视频版自我介绍。建议内容依次为：个人定位、为何选择金融数学、一个最能代表你的项目、未来研究兴趣。'],
    items: ['建议提供：MP4 文件或公开视频链接', '可选材料：中英文字幕文件、封面图、英文版视频', '正式视频接入后，此卡片将直接显示播放器'],
    materials: []
  },
  education: {
    kicker: 'Education · 2024.08—2028.07',
    title: '西交利物浦大学 · 金融数学',
    paragraphs: ['金融数学学士在读，大二下均分 91.2，年级前三。课程训练覆盖概率、计算、金融与数据科学，为进一步研究随机建模、计算金融和智能体应用建立基础。'],
    items: ['核心课程：随机过程、偏微分方程、数值分析、金融工程', '方法训练：机器学习、数据分析、Python 编程、Agent / RAG 工程', '申请方向：金融数学、计算金融、金融工程及相关数量专业'],
    materials: []
  },
  'research-stochastic': {
    kicker: 'Research Interest I',
    title: '随机过程与计算金融',
    paragraphs: ['关注随机过程的可计算表达，以及随机波动率、跳扩散与马尔可夫链近似在定价和风险分析中的应用。'],
    items: ['已有项目：CTMC 近似、Heston 碳期权定价', '希望深化：随机微分方程、数值 PDE、蒙特卡洛方法'],
    materials: []
  },
  'research-ml': {
    kicker: 'Research Interest II',
    title: '统计学习与资产定价',
    paragraphs: ['关注高维与非结构化金融数据中的预测信号，以及样本外稳健性、组合可交易性与模型解释。'],
    items: ['已有项目：金融价格图像 CNN、LightGBM 集成建模', '评估重点：Rank IC、ICIR、组合收益、回撤与换手率'],
    materials: []
  },
  'research-complex': {
    kicker: 'Research Interest III',
    title: '复杂系统的跨学科建模',
    paragraphs: ['尝试将机理模型与数据驱动方法结合，在金融之外的复杂系统中研究动态特征、风险预测与可解释性。'],
    items: ['当前独立研究：流体力学与机器学习的银屑病风险预测', '方法关注：多模态特征、模型校准、可解释机器学习'],
    materials: []
  },
  'library-agent': {
    kicker: 'AI / Agent Project · Core Developer',
    title: '校园智能图书馆 Agent（本地 RAG 知识库）',
    paragraphs: [
      '面向校内学生搭建学习资料智能体，以 Streamlit 和本地 Llama3 构建交互问答，让 PDF、PPT、Word、Excel、CSV、Python、Notebook 等学习材料可以被统一解析、检索和追问。',
      '这个项目的重点不只是“能聊天”，而是让知识库有可靠的文件解析、增量索引、问题路由、来源溯源和局域网交付能力。'
    ],
    items: [
      '通过 Ollama nomic-embed-text 完成 Chunk Embedding，以 SQLite 存储向量与元数据并实现余弦检索',
      '设计 file_manifest 增量索引流程，减少重复 OCR 与 Embedding 成本',
      '设计 library / python / hybrid 三类问题路由与 Retrieved Context 溯源',
      '接入波动率、历史 VaR、Expected Shortfall 与 GARCH proxy 等计算工具',
      '加入 PyMuPDF + RapidOCR / PaddleOCR 回退，修复扫描 PDF 与整页 PPT 识别',
      '实现密码登录、本地文件管理及局域网部署，并编写 35 页使用与调试教程'
    ],
    materials: [
      { label: 'GitHub 主页', url: 'https://github.com/wusuoweiking123-dotcom' }
    ]
  },
  'portfolio-agent': {
    kicker: 'Personal Product · Independent Developer',
    title: '个人作品集网站与 RAG Agent',
    paragraphs: [
      '把个人网站、简历、项目说明和研究材料整合成一个可访问、可检索、可对话的作品集系统，目标是让访客可以直接询问“这个项目怎么做”“王忆航的贡献是什么”“成果在哪里看”。',
      '后端提供 REST API、文档入库、TF-IDF 检索、OpenAI-compatible 模型回答和来源展示；前端嵌入到个人网站，并保留 Docker 与 n8n 自动化接口。'
    ],
    items: [
      '完成个人项目展示网站，并将 AI 智能体嵌入为作品集问答入口',
      '支持资料入库、本地检索、模型回答、来源片段返回和网页端交互',
      '提供 /api/chat 与 /api/agent/run 接口，方便后续接入 n8n 或其他自动化流程',
      '公开部署采用静态网站 + 受保护后端的方式，避免模型 API Key 暴露在浏览器中'
    ],
    materials: [
      { label: 'GitHub 主页', url: 'https://github.com/wusuoweiking123-dotcom' }
    ]
  },
  psoriasis: {
    kicker: 'Independent Interdisciplinary Research · Ongoing',
    title: '基于流体力学与机器学习的银屑病风险预测',
    paragraphs: ['由我独立提出并推进的跨学科研究，探索微循环血流动力学与炎症状态之间的量化联系，目标是构建兼顾机理解释与预测能力的风险分层框架。当前页面仅陈述研究问题与方法规划，不主张未经验证的医学因果关系。'],
    items: ['独立负责研究问题定义、文献梳理、方法设计与后续实验规划', '提取流速、压力梯度、壁面剪切应力等潜在动力学特征', '融合临床指标、时序信息与模拟特征进行统计学习', '通过交叉验证、校准分析和特征归因评估稳健性'],
    materials: [
      { label: '研究包 Markdown', url: 'psoriasis_lesion_expansion_research_package.md' },
      { label: '10 天交互式研究计划', url: 'psoriasis_ai_stage1/psoriasis_ai_10_day_interactive_guide.html' },
      { label: '文献矩阵 Excel', url: 'outputs/psoriasis_ai_stage1/psoriasis_ai_literature_matrix_stage1.xlsx' }
    ]
  },
  'asset-pricing': {
    kicker: 'Asset Pricing · Project Developer',
    title: 'A 股 CNN 价格图像与交易研究',
    paragraphs: ['将结构化的 OHLCV 时序转化为 5 / 20 / 60 日灰度矩阵，研究多尺度 CNN 能否识别传统人工因子之外的短期交易信号，并用可实现交易规则验证样本外表现。'],
    items: ['使用 PyTorch 训练多尺度 CNN，并完成 5 次集成、跨窗口迁移、横截面排序与 IC / 因子回归', '在 66 周可实现性评估中采用下一交易日开盘买入，并扣除单边万三交易费率', '固定候选策略后半段 Sharpe 为 2.26（33 周，持续前向验证）', '研究已由周频推进至高频交易版本'],
    materials: [
      { label: '查看项目完整报告', url: 'https://www.kdocs.cn/l/cuZnq75Yf1Ko' },
      { label: '本地代码 README', url: 'cnn-price-images-a-share/README.md' },
      { label: '中文项目说明', url: 'cnn-price-images-a-share/docs/PROJECT_SUMMARY_CN.md' },
      { label: 'GitHub 主页', url: 'https://github.com/wusuoweiking123-dotcom' }
    ]
  },
  'treasury-cnn': {
    kicker: 'Fixed Income CNN · Project Developer',
    title: '中金所国债期货 CNN 期限结构研究',
    paragraphs: ['将股票价格图像 CNN 迁移至国债期货 TF / T / TS / TL，构建连续期限面板和真实展期收益，避免跨合约价格直接相除造成机械跳变。'],
    items: ['构建 t+0 / t+1 / t+2 连续期限面板，处理合约切换和期限结构口径', '搭建 1 / 5 / 20 日多尺度 CNN 与 3-12 通道扩展方案', '采用时间顺序切分、purge 与样本外买入日期排序降低泄漏风险', 'GPU 训练和稳定性检验持续推进中'],
    materials: [
      { label: '本地代码 README', url: 'treasury-bonds-futures-cnn/README.md' },
      { label: '研究笔记', url: 'treasury-bonds-futures-cnn/docs/research_note_v1.md' },
      { label: 'GPU 运行说明', url: 'treasury-bonds-futures-cnn/RUN_ON_GPU.md' },
      { label: 'GitHub 主页', url: 'https://github.com/wusuoweiking123-dotcom' }
    ]
  },
  ctmc: {
    kicker: 'Stochastic Modeling · Research Member',
    title: 'CTMC Approximation for Stochastic Financial Modeling',
    paragraphs: ['研究连续时间马尔可夫链近似在扩散与跳扩散过程中的数值应用，并将理论近似落实为可计算的定价框架。'],
    items: ['状态空间离散化与生成矩阵构建', '参数估计与衍生品定价模块设计', '探索数值随机方法与机器学习的结合'],
    materials: [
      { label: 'GitHub 主页', url: 'https://github.com/wusuoweiking123-dotcom' }
    ]
  },
  mcm: {
    kicker: '2026 MCM/ICM · Core Modeler',
    title: '不可观测规则变化下的评判稳健性',
    paragraphs: ['针对 DWTS 评分机制中隐蔽投票不可观测、规则变化影响公平性的问题，构建混合模型并量化结论的不确定性。'],
    items: ['搭建 HP-MBRF 混合建模框架，融合线性/整数规划、随机森林、最大熵原则与 Bootstrap', '使用 LMM 与 LightGBM 集成模型分析多维因素与非线性关系', '完成 100,000 次蒙特卡洛路径迭代及截断对数正态分布拟合', '92% 样本落入不确定性区间，结构一致性 SCS=0.85；结合安全区模型与 NSGA-II 完成多目标优化'],
    materials: [
      { label: 'GitHub 主页', url: 'https://github.com/wusuoweiking123-dotcom' }
    ]
  },
  'carbon-option': {
    kicker: 'Quantitative Consulting Case · Deputy Lead',
    title: '中国碳期权定价模型构建',
    paragraphs: ['围绕中国碳排放权的非线性波动特征，构建基于 Heston 随机波动率模型的碳期权定价体系。'],
    items: ['针对传统 Black-Scholes 定价偏差进行随机波动率参数校准', '使用 Python（NumPy/SciPy）完成 100,000 次风险中性蒙特卡洛路径迭代', '检查代码与误差控制逻辑，输出隐含波动率曲面', '完成碳资产公允价值评估与风险敞口测算'],
    materials: [
      { label: 'GitHub 主页', url: 'https://github.com/wusuoweiking123-dotcom' }
    ]
  },
  'var-project': {
    kicker: 'Financial Risk Training · Core Member',
    title: '金融风险量化与估值实训',
    paragraphs: ['以大规模金融交易数据为对象，完成从数据清洗、特征提取到投资组合风险估值的完整流程。'],
    items: ['使用 SQL 清洗交易数据并提取风险特征', '以 Python 构建蒙特卡洛模型评估复杂投资组合 VaR', '完成多情景现金流折现与敏感性分析', '量化分析报告在实训团队中获得优异评价'],
    materials: [
      { label: 'GitHub 主页', url: 'https://github.com/wusuoweiking123-dotcom' }
    ]
  },
  'coffeeco-strategy': {
    kicker: 'BCG Digital Transformation · Product Strategy',
    title: 'CoffeeCo 数字客户旅程与个性化产品策略',
    paragraphs: [
      '面向 CoffeeCo 中国市场饱和、竞争加剧与客户数据利用不足的问题，从用户视角梳理数字客户旅程，并将市场标杆洞察转化为移动端个性化功能建议。',
      '先研究领先餐饮品牌的移动应用与客户互动机制，再结合客户旅程痛点，围绕“消息内容、触达时机、优惠机制与反馈闭环”建立互斥且完备的个性化机会框架，支持团队选择最值得进入 Sprint 的产品方向。'
    ],
    items: [
      '完成 2 个 F&B 头部移动应用案例研究，提炼会员、推荐、移动点单与奖励机制的参与度驱动因素',
      '从客户影响、发生频率和数字化可解决性三个维度判断旅程痛点优先级',
      '将个性化方案拆分为用户数据与分群、内容与推荐、情境触发、激励机制、渠道编排和学习反馈六类',
      '输出可直接用于客户讨论的市场研究及产品推荐 PowerPoint'
    ],
    materials: [
      { label: '移动应用标杆研究 PPTX', url: 'assets/coffeeco/Coffee_App_Engagement_Benchmark.pptx' },
      { label: '个性化功能建议 PPTX', url: 'assets/coffeeco/CoffeeCo_Personalization_Recommendations.pptx' }
    ]
  },
  'coffeeco-pilot': {
    kicker: 'BCG Digital Transformation · Analytics & Agile Delivery',
    title: 'CoffeeCo 个性化试点分析与敏捷产品迭代',
    paragraphs: [
      '针对“24 小时内购买大杯享 9 折”和“升级大杯后搭配糕点享 5 折”两项一周试点，建立公式驱动的 Excel 模型，比较交易量、收入、利润池、利润率和平均客单价，并形成全国规模化情景。',
      '分析显示 Pilot 1 的总量效应更强，按 52 周年化可带来约 11.37 万美元收入增量和 7.92 万美元利润增量；Pilot 2 的平均客单价提升更强，增加约 0.51 美元。基于结果建议先以随机留出组复测 Pilot 1，同时将 Pilot 2 优化为高糕点倾向客群的交叉销售机制。'
    ],
    items: [
      '设计转化率、兑换率、大杯占比、食品附加率、客单价、单客利润和增量利润等 KPI 体系',
      '保留原始数据并建立可审计公式，设置全国人口系数、年化周期与试点周期等可编辑假设',
      '明确当前数据缺少随机对照、曝光量和客户 ID，因此将结果定位为描述性估算而非因果结论',
      '将下一 Sprint 拆解为 4 个 Epics、5 个 User Stories，以及规则设计、开发、埋点、A/B 测试和复盘任务'
    ],
    materials: [
      { label: '试点影响分析 Excel', url: 'assets/coffeeco/CoffeeCo_Pilot_Impact_Analysis.xlsx' },
      { label: '中国市场影响总结 PPTX', url: 'assets/coffeeco/CoffeeCo_Pilot_Impact_China.pptx' },
      { label: 'Trello 看板截图', url: 'assets/coffeeco/CoffeeCo_Trello_Board.png' },
      { label: '打开 Trello 看板', url: 'https://trello.com/b/ngBaltKp/coffeeco-personalization-sprint' },
      { label: 'Scrum Sprint Planning', url: 'https://www.scrum.org/resources/what-is-sprint-planning' },
      { label: 'Atlassian：Agile Epics', url: 'https://www.atlassian.com/agile/project-management/epics' }
    ]
  },
  'walmart-engineering': {
    kicker: 'Walmart USA Advanced Software Engineering · Virtual Experience',
    title: 'Walmart 软件工程虚拟体验项目',
    paragraphs: [
      '围绕数据结构、软件架构、关系型数据库设计和数据工程四类真实业务场景，独立完成从需求拆解、方案设计、编码测试到技术交付的完整流程。',
      '项目将性能与可扩展性作为核心约束：使用数组实现分支数为 2^branchingExponent 的泛型最大堆；以策略模式解耦处理模式与数据库连接；设计规范化宠物商品数据库；并将三套不同结构的物流 CSV 聚合、关联后以事务方式写入 SQLite。'
    ],
    items: [
      '实现 Java PowerOfTwoMaxHeap，支持 insert 与 popMax，并覆盖空堆、重复值、整数极值、最小及最大分支指数等边界情况',
      '以 Java PriorityQueue 为基准完成 600,000 次随机操作验证，在较大分支数下减少树高并控制额外内存占用',
      '使用 ProcessingMode 与 DatabaseConnector 两组接口分离运行模式和 Postgres、Redis、Elastic 数据库差异，体现 Strategy、依赖倒置与开闭原则',
      '将商品、动物、制造商、客户交易、交易明细、门店、物流批次与物流明细建模为规范化关系，并正确表达多对多关系',
      '用 Python csv、Counter 和 sqlite3 合并三张物流表，按 shipment-product 聚合数量、关联起讫地点，并在单一事务中批量写入数据库'
    ],
    materials: [
      { label: '最大堆 Java 源码', url: 'assets/walmart/PowerOfTwoMaxHeap.java' },
      { label: '最大堆测试代码', url: 'assets/walmart/PowerOfTwoMaxHeapTest.java' },
      { label: '数据处理器 UML（PDF）', url: 'assets/walmart/data_processor_uml_class_diagram.pdf' },
      { label: '宠物部门规范化 ERD（PDF）', url: 'assets/walmart/walmart_pet_department_normalized_erd.pdf' },
      { label: '物流数据库脚本（PDF）', url: 'assets/walmart/walmart_shipping_database_loader_script.pdf' },
      { label: '物流 ETL Python 源码', url: 'assets/walmart/populate_database.py' },
      { label: 'Walmart 项目仓库', url: 'https://github.com/theforage/forage-walmart-task-4' }
    ]
  },
  'trs-ai': {
    kicker: 'Internship Project · 2026.07.15—2026.08.14',
    title: '拓尔思智能 · 大模型应用开发实习项目',
    paragraphs: [
      '围绕大模型应用开发进行项目制实习，训练从模型调用、Prompt 设计、RAG 检索到 Agent 工作流落地的完整思路。',
      '这段经历把个人项目中的本地 RAG 实践，进一步连接到企业场景里的需求文档、技术路线、原型测试和项目汇报。'
    ],
    items: [
      '学习 LLM 结构与训练逻辑，实践基座模型调用和离线部署',
      '实践结构化 Prompt、CoT、RAG、ReAct / ToT / SC 等推理与工作流方法',
      '完成智能学习助手 RAG 实践与 Coze Agent 工作流搭建',
      '学习 MCP、后端 API 与外部工具调用',
      '参与需求文档、技术路线、原型测试和项目汇报'
    ],
    materials: []
  },
  'citic-bank': {
    kicker: 'Internship · 2025.08—2025.09',
    title: '中信银行苏州分行',
    paragraphs: ['围绕客户资料、业务文件和网点流程开展支持工作，从实际材料中理解商业银行合规、内控与风险提示机制。'],
    items: ['核验客户资料和业务文件的完整性、材料一致性与流程规范性', '参与借记卡、提升财务卡等业务办理，梳理不同产品的流程与风险提示', '协助交易相关数据的核验、整理与异常信息排查'],
    materials: []
  },
  'citic-securities': {
    kicker: 'Internship · 2025.01—2025.02',
    title: '中信证券苏州分公司',
    paragraphs: ['工作覆盖策略验证、客户数据分析、产品技术分析和投资组合研究，核心是把市场数据转化为可检验的投资判断。'],
    items: ['使用 Wind 筛选游戏传媒标的，构建量化分析框架并验证“龙头成长+预留调仓”分仓策略', '基于客户财务数据与交易行为搭建四维客户画像，通过聚类识别风险偏好并支持差异化产品配置', '系统学习基金、私募等产品特性及两融、期权交易底层逻辑，完成计算练习', '使用 KDJ、MACD 与“箱上箱”方法分析股票支撑位和压力位', '独立搭建量化模拟账户，结合蒙特卡洛预测与历史回测评估风险收益特征'],
    materials: []
  },
  weige: {
    kicker: 'Internship · 2024.06—2024.09',
    title: '宁波唯格服饰有限公司',
    paragraphs: ['围绕企业交易单据、往来款项和银行流水进行财务基础工作，建立业务事件与会计记录之间的勾稽关系。'],
    items: ['核对合同、订单、发票与付款记录，确保基础信息对应一致', '维护应收应付、费用报销和基础台账资料', '按银行流水核验资金记录，追踪业务单据与财务凭证的链条', '辅助识别现金流记录中的异常与潜在财务风险'],
    materials: []
  },
  'campus-leadership': {
    kicker: 'Campus Leadership · 2025.04—Present',
    title: '西交利物浦大学义工学院 · 公益部部长',
    paragraphs: ['负责支教项目外联、资源协调和日常公益服务运营，在多人协作与对外沟通中承担组织责任。'],
    items: ['维护 3 个支教点的合作关系', '拓展 8 个活动点与 5 处寒假支教资源', '达成 10+ 家商户赞助意向', '统筹公益咖啡服务，每天服务 20+ 人次；坐班响应每天 15+ 人次咨询'],
    materials: []
  },
  'mcm-award': {
    kicker: 'Award · 2026',
    title: 'MCM/ICM Honorable Mention',
    paragraphs: ['2026 年美国大学生数学建模竞赛 Honorable Mention，对应项目为不可观测规则变化下的评判稳健性研究。'],
    items: ['角色：核心建模成员', '工作：模型设计、统计分析与结果验证'],
    materials: []
  },
  phototherapy: {
    kicker: 'Innovation Project',
    title: '智能光疗解决方案创新项目',
    paragraphs: ['围绕头癣治疗场景参与需求分析、市场调研、商业计划书与项目可行性分析，项目获江苏省大学生创新训练计划省级立项及 6000 元资金支持。'],
    items: ['负责产品方案与商业化问题分析', '参与专利申请材料准备', '训练跨学科信息整合与商业表达能力'],
    materials: []
  },
  'stock-award': {
    kicker: 'Competition Award',
    title: '“信浦杯”模拟炒股比赛一等奖',
    paragraphs: ['在模拟投资环境中综合市场信息、风险控制与组合判断，获得一等奖。'],
    items: ['可在此处绑定获奖证书、比赛结果或策略复盘'],
    materials: []
  },
  'innovation-award': {
    kicker: 'Competition Award',
    title: '西浦创新创业比赛三等奖',
    paragraphs: ['参赛项目在 175 支团队中位列第 6，获得三等奖。'],
    items: ['可在此处绑定获奖证书、路演材料或项目介绍'],
    materials: []
  },
  'english-award': {
    kicker: 'Language Competition Award',
    title: '“外研社杯”英语演讲浙江省一等奖',
    paragraphs: ['在英语演讲赛事中获得浙江省一等奖，体现英文表达、公开陈述与现场沟通能力。'],
    items: ['可提供：获奖证书、赛事结果或演讲视频'],
    materials: []
  },
  'fund-award': {
    kicker: 'Investment Competition Award',
    title: '永明金融港股基金模拟大赛冠军',
    paragraphs: ['在港股基金模拟投资环境中完成组合判断与风险控制，获得赛事冠军。'],
    items: ['可提供：获奖证书、组合记录或投资复盘'],
    materials: []
  },
  'skills-programming': {
    kicker: 'Technical Toolkit',
    title: '编程与数据工具',
    paragraphs: ['能够使用 Python 与 SQL 完成数据处理、数值模拟和模型实现。'],
    items: ['Python：NumPy、SciPy、Pandas、PyTorch', 'SQL / MySQL：交易数据清洗与特征提取', '办公与分析：Excel 数据透视表、模拟运算表、高级函数'],
    materials: []
  },
  'skills-quant': {
    kicker: 'Quantitative Toolkit',
    title: '精算与量化建模方法',
    paragraphs: ['方法栈覆盖随机模拟、风险估值、统计学习与多目标优化。'],
    items: ['蒙特卡洛模拟、Heston 随机波动率模型', 'LMM、Bootstrap 与混合建模', 'VaR 风险分析、NSGA-II 多目标优化'],
    materials: []
  },
  'skills-finance': {
    kicker: 'Financial Toolkit',
    title: '金融数据与分析平台',
    paragraphs: ['具备市场数据检索、金融分析和量化报告制作的工具基础。'],
    items: ['Wind、Choice、EViews', 'Excel、PowerPoint、Word', '衍生品定价、风险量化与组合分析'],
    materials: []
  },
  certifications: {
    kicker: 'Certification',
    title: '专业资格与持续学习',
    paragraphs: ['已通过基金从业资格考试，并持续进行 CFA 体系学习。'],
    items: ['基金从业资格：已通过', 'CFA Level I：在读，重点学习定量分析与衍生品定价模块'],
    materials: [
      { label: '私募股权投资基金基础知识', url: 'https://human.amac.org.cn/web/network/examPrint.html?idNumber=32080320060107144X&examDate=2025-11-08&courseName=%E7%A7%81%E5%8B%9F%E8%82%A1%E6%9D%83%E6%8A%95%E8%B5%84%E5%9F%BA%E9%87%91%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86&sn=58364215' },
      { label: '基金基础知识与法律法规', url: 'https://human.amac.org.cn/web/network/examPrint.html?idNumber=32080320060107144X&examDate=2025-11-08&courseName=%E5%9F%BA%E9%87%91%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86%E4%B8%8E%E6%B3%95%E5%BE%8B%E6%B3%95%E8%A7%84&sn=58364212' }
    ]
  }
};

const detailDialog = document.getElementById('detail-dialog');
const detailKicker = document.getElementById('detail-kicker');
const detailTitle = document.getElementById('detail-title');
const detailCopy = document.getElementById('detail-copy');
const materialLinks = document.getElementById('material-links');
const materialPending = document.getElementById('material-pending');
const dialogClose = detailDialog.querySelector('.dialog-close');
let lastTrigger = null;

function openDetail(key, trigger) {
  const detail = detailContent[key];
  if (!detail) return;
  lastTrigger = trigger;
  detailKicker.textContent = detail.kicker;
  detailTitle.textContent = detail.title;
  detailCopy.replaceChildren();

  detail.paragraphs.forEach((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    detailCopy.appendChild(paragraph);
  });

  if (detail.items?.length) {
    const list = document.createElement('ul');
    detail.items.forEach((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      list.appendChild(item);
    });
    detailCopy.appendChild(list);
  }

  materialLinks.replaceChildren();
  const materials = detail.materials || [];
  materials.forEach((material) => {
    const link = document.createElement('a');
    link.className = 'button button-material';
    link.href = material.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `${material.label} ↗`;
    materialLinks.appendChild(link);
  });
  materialLinks.hidden = materials.length === 0;
  materialPending.hidden = materials.length > 0;
  detailDialog.showModal();
}

document.querySelectorAll('[data-detail]').forEach((card) => {
  card.addEventListener('click', () => openDetail(card.dataset.detail, card));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetail(card.dataset.detail, card);
    }
  });
});

function closeDetail() {
  detailDialog.close();
  lastTrigger?.focus();
}

dialogClose.addEventListener('click', closeDetail);
detailDialog.addEventListener('click', (event) => {
  if (event.target === detailDialog) closeDetail();
});

const DEFAULT_PUBLIC_AGENT_API_BASE = 'https://personal-portfolio-o2ed.onrender.com';
const configuredAgentApiBase = window.PORTFOLIO_AGENT_API_BASE || '';
const agentApiBase = configuredAgentApiBase || (window.location.protocol === 'file:' ? 'http://127.0.0.1:8765' : DEFAULT_PUBLIC_AGENT_API_BASE);
const isPublicAgentPage = window.location.protocol !== 'file:';
const canManageAgentDocs = !isPublicAgentPage || window.PORTFOLIO_AGENT_ADMIN === true;
const agentAdminToken = window.PORTFOLIO_AGENT_ADMIN_TOKEN || '';
const agentStatus = document.getElementById('agent-status');
const agentMessages = document.getElementById('agent-messages');
const agentChatForm = document.getElementById('agent-chat-form');
const agentQuestion = document.getElementById('agent-question');
const agentDocForm = document.getElementById('agent-doc-form');
const agentDocTitle = document.getElementById('agent-doc-title');
const agentDocContent = document.getElementById('agent-doc-content');
const agentDocFile = document.getElementById('agent-doc-file');
const agentDocList = document.getElementById('agent-doc-list');
const agentRefreshDocs = document.getElementById('agent-refresh-docs');

function setAgentStatus(text) {
  if (agentStatus) agentStatus.textContent = text;
}

async function agentRequest(path, options = {}) {
  if (!agentApiBase) {
    throw new Error('公网智能体后端尚未接入');
  }
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeout || 65000);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (agentAdminToken) headers['X-Admin-Token'] = agentAdminToken;
  try {
    const response = await fetch(`${agentApiBase}${path}`, {
      ...options,
      headers,
      mode: 'cors',
      signal: controller.signal
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '请求失败');
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('智能体响应超时，请稍后再试。Render 免费实例偶尔需要唤醒。');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function addAgentMessage(role, text, sources = []) {
  const message = document.createElement('article');
  message.className = `agent-message ${role}`;
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  message.appendChild(paragraph);

  if (sources.length) {
    const sourceList = document.createElement('div');
    sourceList.className = 'agent-sources';
    sources.slice(0, 4).forEach((source) => {
      const item = document.createElement('div');
      item.className = 'agent-source';
      const content = source.content.length > 150 ? `${source.content.slice(0, 150)}...` : source.content;
      item.textContent = `《${source.doc_title}》片段 ${source.chunk_index + 1} · 相关度 ${source.score}: ${content}`;
      sourceList.appendChild(item);
    });
    message.appendChild(sourceList);
  }

  agentMessages?.appendChild(message);
  if (agentMessages) agentMessages.scrollTop = agentMessages.scrollHeight;
  return message;
}

async function loadAgentDocs() {
  if (!agentDocList) return;
  if (agentDocForm && !canManageAgentDocs) {
    agentDocForm.hidden = true;
  }
  if (agentRefreshDocs && !canManageAgentDocs) {
    agentRefreshDocs.textContent = '刷新来源';
  }
  try {
    const docs = await agentRequest('/api/docs');
    agentDocList.replaceChildren();
    setAgentStatus('已连接');

    if (!docs.length) {
      const empty = document.createElement('article');
      empty.className = 'agent-doc-card';
      empty.innerHTML = '<strong>知识库为空</strong><span>先加入简历、项目介绍或研究材料。</span>';
      agentDocList.appendChild(empty);
      return;
    }

    docs.forEach((doc) => {
      const card = document.createElement('article');
      card.className = 'agent-doc-card';
      const title = document.createElement('strong');
      title.textContent = doc.title;
      const meta = document.createElement('span');
      meta.textContent = `${doc.chars} 字符 · ${new Date(doc.created_at).toLocaleString()}`;
      card.append(title, meta);
      if (canManageAgentDocs) {
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = '删除';
        remove.addEventListener('click', async () => {
          await agentRequest(`/api/docs/${doc.id}`, { method: 'DELETE' });
          await loadAgentDocs();
        });
        card.appendChild(remove);
      }
      agentDocList.appendChild(card);
    });
  } catch (error) {
    setAgentStatus('未连接');
    agentDocList.innerHTML = window.location.protocol === 'file:'
      ? '<article class="agent-doc-card"><strong>服务未启动</strong><span>请运行 personal-rag-agent/start.command 后刷新。</span></article>'
      : '<article class="agent-doc-card"><strong>公网后端待接入</strong><span>前端已准备好；部署 Agent 后填写 HTTPS 地址即可让访客对话。</span></article>';
  }
}

agentChatForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = agentQuestion.value.trim();
  if (!question) return;

  addAgentMessage('user', question);
  agentQuestion.value = '';
  setAgentStatus('思考中');
  const pending = addAgentMessage('assistant', '正在检索知识库...');

  try {
    const data = await agentRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: question, top_k: 3 })
    });
    pending.remove();
    addAgentMessage('assistant', data.answer, data.sources || []);
    setAgentStatus('已连接');
  } catch (error) {
    pending.remove();
    const hint = window.location.protocol === 'file:'
      ? '请确认 personal-rag-agent/start.command 对应的 Terminal 窗口正在运行。'
      : `我已经尝试连接 ${agentApiBase}。如果刚打开页面就失败，请刷新一次；Render 免费实例偶尔需要几十秒唤醒。`;
    addAgentMessage('assistant', `暂时连不上智能体服务：${error.message}\n${hint}`);
    setAgentStatus('未连接');
  }
});

agentQuestion?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    agentChatForm.requestSubmit();
  }
});

agentDocForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!canManageAgentDocs) {
    addAgentMessage('assistant', '公开页面只开放访客问答，不开放资料入库。知识库更新请在本地或受保护后台完成。');
    return;
  }
  const title = agentDocTitle.value.trim();
  const content = agentDocContent.value.trim();
  if (!content) return;

  setAgentStatus('入库中');
  try {
    await agentRequest('/api/docs', {
      method: 'POST',
      body: JSON.stringify({ title, content })
    });
    agentDocTitle.value = '';
    agentDocContent.value = '';
    agentDocFile.value = '';
    await loadAgentDocs();
  } catch (error) {
    setAgentStatus('入库失败');
    addAgentMessage('assistant', `资料入库失败：${error.message}`);
  }
});

agentDocFile?.addEventListener('change', async () => {
  const file = agentDocFile.files?.[0];
  if (!file) return;
  agentDocTitle.value = agentDocTitle.value || file.name;
  agentDocContent.value = await file.text();
});

agentRefreshDocs?.addEventListener('click', loadAgentDocs);
loadAgentDocs();
