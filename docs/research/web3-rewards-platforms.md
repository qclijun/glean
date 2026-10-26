# Web3 奖励任务平台与目录：公开读取能力

核对日期：2026-10-26。目的：为跨平台发现活动选择**有官方依据的读取入口**。下文“公开页面”只表示浏览器可查看；不等于平台授权批量抓取、存在稳定 API 或保证收录完整。未取得凭据、未调用需鉴权端点；费率未公布时记为“未知”。

## 任务平台

| 平台 | 已核实入口、范围与可见字段 | 鉴权、限制及判断 |
| --- | --- | --- |
| Galxe | [Quest Explore](https://app.galxe.com/quest/explore/all)公开展示任务，并提供状态、奖励类型、生态等筛选。官方 [Quest API](https://docs.galxe.com/galxe-integration/api-reference/quest) 提供 `quest(id)` 的名称、描述、状态、起止时间、人数、积分、Space、链等字段；`quests(input)` 示例按 `spaceId`、状态、类型分页，返回 `totalCount` 与游标。 | [所有 API 请求需 access token](https://docs.galxe.com/galxe-integration/getting-started/authentication)，从账户的 Server API 设置生成，以 `access-token` 请求头传递；[免费档 10 QPS、每月 100,000 请求](https://docs.galxe.com/galxe-integration/resources/rate-limits)。文档支持**已知 Space 内**枚举；未从这些文档证实无需预先获得 Space ID 的全站任务枚举。Explore 页面可供人工发现，页面筛选/排序不是 API 合约。 |
| Zealy | [Explore](https://zealy.io/explore?category=all)公开展示社区；[Earn](https://zealy.io/earn)展示奖励任务。官方[曝光规则](https://www.zealy.io/docs/start-guide/visibility)称免费社区不出现在 Explore/Earn 等推荐位，Earn 只展示 USDC 或 Zaps 的个人任务，因此公开目录覆盖不全。[Community lookup](https://docs.zealy.io/api-reference/communities/community-lookup) 可按已知 subdomain 读名称、描述、行业、链、成员数，对任何社区开放。 | API 仍须社区设置生成的 `x-api-key`，可设只读权限；[无凭据请求失败](https://docs.zealy.io/authentication)。关键：[`GET /public/communities/{subdomain}/quests`](https://docs.zealy.io/api-reference/quests/list-quests) **明确要求 Admin role**，虽然 URL 含 `public`，不得用作公开跨社区任务发现 API。其响应含任务名称、发布/归档状态、周期、奖励、任务、领取计数等；领取计数缓存 1 小时。[API 上限 50 RPS](https://docs.zealy.io/rate-limits)，更高限额属高级方案。 |
| Layer3 | [Discover](https://app.layer3.xyz/discover)公开显示 All、New、Collections、Ecosystems、Campaigns、Streaks 等分类，单个 [Activation 页面](https://app.layer3.xyz/activations/cubes-on-ink)可见任务介绍；参与需要登录/钱包。 | 在核对的官方发现页未找到对外发布的活动列表 API、RSS、字段模式或调用额度；暂作**人工发现入口**，不将网页内部请求当作许可的接口。页面结构、活动曝光和登录要求会变。 |
| QuestN | [官方文档](https://questn.gitbook.io/docs)把 `app.questn.com` 指为 Start Earning 入口，说明用户可查找空投项目；[推广说明](https://questn.gitbook.io/docs/airdrop-promotion/introduction)说明首页 banner、推荐任务和集合受推广安排影响。 | 本次官方资料未证实公开任务列表 API、RSS、字段模式或费率。官网应用在本次网页读取中超时，因此不能声称页面数据可匿名批量读取；仅保留官网入口，需后续浏览器复核。 |
| TaskOn | [官方社区创建指南](https://taskoncommunitys-organization.gitbook.io/guide-book/getting-started/how-to-create-your-community)说明公开社区可出现在 Discover，private 社区不会出现；任务设置包含名称、期限、描述、奖励、任务。[方案页](https://taskoncommunitys-organization.gitbook.io/guide-book/billing-and-plans)说明首页推荐位与套餐相关。 | [Embed SDK](https://taskon-xyz.github.io/taskon-embed/guide/getting-started.html)服务嵌入和签名；[API-Verified Task](https://taskoncommunitys-organization.gitbook.io/guide-book/boost-engagement/task-system/general-tasks/api-task)是平台调用项目提供的验证 API。二者都不是公开活动列表 API。本次未核实开放列表 API、RSS、读取额度；Discover 只可作为人工入口。 |

## 空投与生态奖励目录

| 来源 | 能读到什么 | 采用边界 |
| --- | --- | --- |
| [Airdrops.io Latest](https://airdrops.io/latest/) | 目录公开列出项目、持续/确认状态、行动摘要，并有链、类型、日历等分类。 | [站方条款](https://airdrops.io/terms-conditions/)只许可个人、非商业、暂时性浏览，限制复制和商业使用；**不能把公开网页视为可供产品批量采集/再发布的数据源**。未验证官方 API/RSS。 |
| [CoinMarketCap Airdrops](https://coinmarketcap.com/airdrop/) | 公开空投页面显示即将到来的空投与活动。 | 本次未核实空投专用 API/RSS、授权转载范围和费率；仅作为人工线索，具体奖励须回到项目及平台原始页面复核。 |
| [DefiLlama Airdrops](https://defillama.com/airdrops) | 这里列的是**尚无代币的协议**，字段如类别、TVL、融资、上架时间。 | 这是潜在线索，不是已公布奖励、空投资格或任务清单；不可把“tokenless”标成确定空投。 |

## 赏金、Grant、黑客松

| 来源 | 官方可见入口与字段 | API/范围判断 |
| --- | --- | --- |
| [Superteam Earn](https://superteam.fun/earn/) | 公开机会页含 bounty 与项目工作；[官方 Agent 文档](https://superteam.fun/earn/agents)还提供 `GET /api/agents/listings/live?take=20`，可按 `type=bounty|project|hackathon` 过滤，并读详情的内容、技能、报酬、奖励、主办方和黑客松上下文。 | 需先注册 agent 取得 Bearer API key；接口**仅返回 `AGENT_ALLOWED` / `AGENT_ONLY` 的 agent 可参与机会**，默认只取未过期机会，并非全部公开机会。文档列注册 60/IP/小时及提交等限额，**未单列读取接口限额**；429 需处理。 |
| [Gitcoin Campaigns](https://gitcoin.co/campaigns) / [Grants Program](https://gitcoin.co/program) | 官方活动页列进行中/历史资助轮次、资金池、项目数和期间；官方说明 Explorer 可浏览每轮获准项目。 | 可人工发现 Grant 轮次及项目；本次未核实对外目录 API/RSS 与费率。轮次页和项目申请窗口有不同生命周期，不能把展示中的项目当作正在开放申请。 |
| [ETHGlobal Events](https://ethglobal.com/events) | 官方活动页列 Featured、Upcoming、Past，提供活动名、类型、地点、日期，并可按关键词、国家、年份、类型筛选。 | 适合作黑客松人工发现；未核实官方开放列表 API/RSS 和额度。活动“即将举办”不保证仍接受报名，需点活动详情验证。 |
| [Devpost Hackathons](https://devpost.com/hackathons) | 官方公开黑客松目录，明确区分公开与私有团队活动。 | 可作为更广泛的黑客松人工线索；未核实开放列表 API/RSS、额度或 Web3 专项完整覆盖。 |

## 研究结论与后续验证

1. 可优先评估的**有文档接口**是 Galxe 按已知 Space 的 token 鉴权 Quest API，以及 Superteam Earn 范围受限的 Agent listings API。Zealy 的社区 lookup 可用于已知 subdomain 的基本资料，但任务列表只给管理员。
2. Layer3、QuestN、TaskOn、Gitcoin、ETHGlobal、Devpost 等先保留官方页面线索；未找到或未核实公开列表接口不等于断言接口不存在。若要自动采集，应向平台确认授权、费率、分页、稳定字段和完整性，再做技术验证。
3. 对每条发现保留原始 URL、来源、读取时间、活动起止时间、奖励类型、资格与可信度；空投目录内容须回源验证，尤其不要把“潜在”写成“确定”。官网曝光位有付费/筛选、活动下架及结构变化风险，且公开可见不等于可复制再发布。
