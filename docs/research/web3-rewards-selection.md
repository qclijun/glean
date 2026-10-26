# Web3 奖励活动发现：现成方案调研与选型

研究快照：2026-10-26。对应 [wayfinder 地图](https://github.com/qclijun/glean/issues/1)与[选型决策票](https://github.com/qclijun/glean/issues/2)。本文件是来源与工具选型建议，不代表任何活动仍开放、奖励可兑现，亦不授权批量抓取、钱包操作或自动参与。

## 目标与判定口径

Glean 目前是[人工策展的前端工作台](../../README.md)，数据是定日快照，没有自动采集或账户后端。选型覆盖空投/交互任务、测试网/生态激励、赏金、Grant、黑客松。**活动线索**是尚未由主办方规则核实的提及；**奖励活动**以主办方活动页或规则页为依据，对外展示前还需核对参与条件、时间与费用。只有代币缺位、融资或社交热度的信息仍是潜在机会，不是已公布的奖励活动。

评估顺序：① 来源合法性与可回溯性；② 实际覆盖和字段；③ 持续更新、去重与失效处理；④ 部署、凭据、配额和费用；⑤ 维护状态与软件许可。没有量过召回率、误报率或端到端告警延迟，因此不捏造分数。三份一手研究分别核对了[开源项目](https://github.com/qclijun/glean/blob/research/web3-open-source/docs/research/web3-rewards-open-source.md)、[社交/公告渠道](https://github.com/qclijun/glean/blob/research/web3-social/docs/research/web3-rewards-social.md)和[任务平台/目录](https://github.com/qclijun/glean/blob/research/web3-platforms/docs/research/web3-rewards-platforms.md)。

## 本轮选型结论

用户确认的用途是**对外产品**，**优先免费、自托管，后续可迁移付费托管**，并希望**多收线索、人工核验**。据此，推荐以下顺序；这是来源和现成工具的选择，不是已实施的系统：

1. **主干：官方来源监看。** 先订阅主办方原生 RSS/Atom；没有 feed 的已关注项目，以 Apache-2.0 的 changedetection.io 监看官方活动/规则页。免费软件仍需要主机和维护，页面轮询不能保证实时。把官方页面及其规则版本作为最终核验依据。
2. **扩展：有边界的任务平台与公开频道。** Galxe 使用免费档、token 鉴权的 Quest API 读取**已知 Space**；官方 Telegram 公开频道可评估 RSSHub 路由。Superteam Earn 的 Agent API 只在产品确实需要 agent 可参与的赏金/黑客松子集时加入。Zealy、Layer3、QuestN、TaskOn 的公开目录可供编辑发现，不预设存在跨站完整 API。
3. **广收线索、人工发布。** X、Farcaster、社区 Telegram、Discord、第三方目录和项目融资/TGE 数据都可进入内部待核验清单；重复转发合并但保留原始链接。对外展示前由编辑回到主办方活动页核对奖励、资格、期限与费用。没有官方依据时保持“线索”或“潜在机会”状态，不升级成可领取奖励。

本轮不选单个开源仓库直接替代 Glean：现有样本要么只监看公告、要么接口可用性或许可未证实。尤其不把 n8n 的社区许可视作无条件可嵌入对外产品的开源许可；若仅用作内部编排，仍应按其[许可说明](https://github.com/n8n-io/n8n-docs/blob/main/docs/n8n-community-license/README.md)核对具体用途。X 的 Chrome 会话适合本次人工研究，不能证明可长期、合规地作为产品采集通道。若上述免费途径的覆盖不足，再单独评估付费 API 的成本与授权，不先承诺支出。

自托管方案应保留源清单、原始 URL、抓取时间及核验状态的可导出记录；当实际运行证明维护负担、可用性或平台额度不足时，再比较付费托管服务的迁移成本、数据导出能力及再发布许可。未做运行基准前不设付费切换阈值。

## 候选比较

| 候选与用途 | 已核实的能力 | 主要限制 | 选型位置 |
| --- | --- | --- | --- |
| 项目原生 RSS/Atom + [changedetection.io](https://github.com/dgtlmoon/changedetection.io) | 官方公告有 feed 时直接订阅；无 feed 时监看官方活动/规则页变更。changedetection.io 仓库采用 [Apache-2.0](https://github.com/dgtlmoon/changedetection.io/blob/master/LICENSE)。 | 只能覆盖明确纳入的站点；网页改版或动态计数会制造噪声，轮询频率影响时效。 | 主办方一手来源的优先入口。 |
| [RSSHub](https://github.com/DIYgod/RSSHub) 的 Telegram 路由、[n8n RSS Feed Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.rssfeedreadtrigger/) | 可把部分公开频道和 feed 转为可订阅线索；n8n 可编排定时读取。 | Telegram 路由依赖频道公开预览；n8n 采用 [Sustainable Use License](https://github.com/n8n-io/n8n-docs/blob/main/docs/n8n-community-license/README.md)，对外产品使用需按其许可核对。 | 辅助采集/内部策展工具，不作为全网覆盖证明。 |
| [Galxe Quest API](https://docs.galxe.com/galxe-integration/api-reference/quest) | 使用 token，可按已知 Space 枚举任务；[免费档](https://docs.galxe.com/galxe-integration/resources/rate-limits)为 10 QPS、每月 100,000 次请求。 | 未证实无需预先知道 Space ID 的全站枚举；需管理 token，配额和服务条款会变化。 | 已关注项目的任务来源。 |
| [Superteam Earn Agent API](https://superteam.fun/earn/agents) | 可查询 bounty、project、hackathon 中标记为 agent 可参与的机会。 | 需注册并取得 API key；只覆盖 `AGENT_ALLOWED` / `AGENT_ONLY`，不能代表全部赏金或黑客松。 | 特定赏金/黑客松补充来源。 |
| X、Telegram、Discord、Farcaster | 可较早发现项目/社区公告；X 有官方 [Recent Search](https://docs.x.com/x-api/posts/search/introduction)，Farcaster 可用 [Neynar 搜索](https://neynar.readme.io/reference/search-casts)。 | 凭据、权限、费用、转发与虚假宣传会影响可靠性；Discord 跨服务器正文读取受权限限制。 | 只产出待核验线索，回到主办方页面确认。 |
| [crypto-alpha-feed](https://github.com/Clawthority/crypto-alpha-feed) | MIT 许可；RSS 轮询、关键词评分、去重、JSONL 输出在本地样本测试通过。 | 仅发现公告线索，未核实其公开源的持续可用性或活动规则。 | 若以后需要自建，可参考采集骨架；现在不作为完整成品。 |

## 奖励类型与来源覆盖

| 类型 | 优先核验的原始来源 | 可补充的线索入口 | 尚未证实的自动化范围 |
| --- | --- | --- | --- |
| 空投、交互任务 | 项目官方活动页、Galxe 已知 Space 的 Quest API | Zealy Earn/Explore、Layer3 Discover、官方社交公告 | 跨 Galxe 全站或跨 Zealy 社区完整枚举；目录条目不等于钱包有资格领取。 |
| 测试网、生态激励 | 项目博客、开发者文档、生态活动页 | RSS/网页变更、项目 X/Telegram/Discord | 无统一跨生态公开 API；是否有奖励以项目规则为准。 |
| 赏金 | [Superteam Earn](https://superteam.fun/earn/) 的主办方机会页 | 其 Agent API 中标记可由 agent 参与的子集 | Agent API 不覆盖所有人类赏金。 |
| Grant | [Gitcoin Campaigns](https://gitcoin.co/campaigns)、[Grants Program](https://gitcoin.co/program)及生态基金官方页面 | 官方新闻/RSS、社交公告 | 展示中的资助轮次不代表申请窗口仍开放；未核实通用目录 API。 |
| 黑客松 | [ETHGlobal Events](https://ethglobal.com/events)、[Devpost Hackathons](https://devpost.com/hackathons)及活动详情 | 官方公告、Superteam Agent API 的特定赛道 | 即将举办不等于仍可报名；未核实开放全量 API。 |

## 不宜作为核心来源的候选

- [web3-agent-kit](https://github.com/ulsreall/web3-agent-kit) 有多平台代码，但本次 Zealy、Layer3、QuestN 接口试读分别遇到 403、403、超时；此结果受本次网络环境影响，却足以阻止宣称它现在可直接稳定抓取。自动执行模块也不属于本轮范围。
- [Zealy 任务列表 API](https://docs.zealy.io/api-reference/quests/list-quests) 要求社区 Admin role；`public` 路径名不代表匿名或跨社区可读。Layer3、QuestN、TaskOn 未证实开放列表 API。
- [Airdrops.io](https://airdrops.io/latest/) 可以人工发现线索，但其[使用条款](https://airdrops.io/terms-conditions/)限制复制与商业使用。其他目录如 CoinMarketCap Airdrops 及 [DeFiLlama Airdrops](https://defillama.com/airdrops)同样需区分“已公布奖励”和“无币协议/潜在空投”，也未验证可批量再发布的权利。
- `web3-airdrop-alpha-agent` 虽有多源 collector，但仓库未见明确许可证，且多个外部源默认关闭；`RogueAgent` 主要依赖模型提示词与外部服务；`claimable` 是历史钱包资格查询。均不宜视为可直接替换 Glean 策展流程的成熟成品。详见[源码核验](https://github.com/qclijun/glean/blob/research/web3-open-source/docs/research/web3-rewards-open-source.md)。

## 使用场景如何改变选择

| 场景 | 现成工具的优先组合 | 先确认的代价和边界 |
| --- | --- | --- |
| 个人研究、人工策展 | 项目原生 RSS、changedetection.io、RSSHub；Galxe/Zealy/Layer3 等官方目录人工复核。n8n 可作为个人编排工具。 | 自托管仍有机器和维护成本；公开目录的版权/使用条款、API 配额和活动失效要逐源检查。 |
| 面向外部读者的 Glean 来源扩展 | 保留官方活动页作为发布依据，优先评估许可明确的监看工具与按已知 Space 的 Galxe API；赏金/黑客松补充官方目录及有限范围的 Superteam API。 | 发布或再分发数据前确认平台条款；n8n 的社区许可不能按普通开源许可处理；社交 API 的商业权限与费用另算。 |

两种场景都不建议直接采信社交帖、第三方目录或模型生成的奖励金额。仓库存在不等于来源持续可用；部署工具前应选少量项目，按相同样本手工核验来源召回、误报、重复和失效通知，再决定是否扩大覆盖。

## 广收新活动的来源发现顺序

现有免费工具能持续监看**已知**项目，无法证明发现全网新主办方。为了覆盖所有奖励类型，编辑巡检顺序应是：

1. 先看官方聚合入口：任务看 Galxe Explore、Zealy Earn/Explore、Layer3 Discover；赏金看 Superteam Earn；Grant 看 Gitcoin 和生态基金官网；黑客松看 ETHGlobal、Devpost。公开目录只作为发现入口，不复制其正文或把曝光位当作完整市场。
2. 再看项目原生公告：对巡检发现的新主办方记录官方网站、活动页、博客/RSS 与官方社交账号，确认身份后加入自托管监看清单。项目来源的扩张需要持续人工策展，不能由按已知 Space 的 API 自动完成。
3. 最后看社区转发、社交关键词和第三方目录：先入内部活动线索清单，保留转发链和原帖，按截止时间、官方来源是否可找到、奖励是否明确安排人工核验。找不到主办方规则的条目留在活动线索或潜在机会，不能对外写成确定奖励。

该顺序支持用户要求的高线索召回，但**不承诺自动全量覆盖**。尤其 Grant、黑客松和新生态项目目前没有已证实的免费统一列表 API；编辑巡检仍是选型中的明确人力成本。

## 对外使用的权限边界

软件许可和活动内容的再发布权是两件事。changedetection.io 的 Apache-2.0 只说明工具代码许可，不授予被监看网站内容的使用权。以下状态按 2026-10-26 已找到的官方资料判断：

| 来源 | 已核实的读取范围 | 对外产品的数据权利结论 |
| --- | --- | --- |
| 项目原生 RSS、官网活动页 | 公开页面或 feed 可供人工阅读；逐站条款未统一核对。 | 仅作为内部核验依据；展示原文、图片或批量再发布前核对该项目条款/授权。 |
| Galxe Quest API | 有 token 的已知 Space 任务查询和免费配额。 | [API 文档](https://docs.galxe.com/galxe-integration/api-reference/quest)未在本轮证明可将任务字段批量再发布；正式接入前确认存储、公开展示、署名及商业使用范围。 |
| Telegram 公开频道经 RSSHub | 公开预览可由 [路由](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/telegram/channel.ts)转换成 feed。 | 路由软件可用不代表频道消息可由产品再发布；需分别核对平台规则和频道所有者授权。 |
| Superteam Earn Agent API | 需 key、仅 agent 可参与子集。 | [Agent 文档](https://superteam.fun/earn/agents)说明读取范围，未证明批量再发布授权；保留为内部评估候选。 |
| Airdrops.io 等第三方目录 | 可人工浏览；Airdrops.io 已有明确的[使用限制](https://airdrops.io/terms-conditions/)。 | 不选作对外产品的批量复制源；其他目录逐项核对条款。 |

因此，“优先组合”表示**先做内部来源评估**，并非这些数据已经获准进入公开目录。对每个来源需确认：允许抓取频率与缓存多久、可公开哪些字段/图片、是否允许商业使用或衍生摘要、署名和删除要求、密钥能否用于该产品。未取得依据时，Glean 只保存内部线索和指向主办方的链接，不声称取得再发布许可。

## 未来托管迁移的候选与成本

本轮不采购。若自托管网页监看成为主要运维负担，最接近的托管替代是 [changedetection.io 官方订阅](https://changedetection.io/)：2026-10-26 页面列 **US$8.99/月，含 5,000 个 URL watch**。它覆盖网页变更，不替代 Galxe、社交或 Grant 的来源授权；自托管实例到托管版的 watch/历史/凭据迁移路径尚未核实，购买前须做小样本导入导出验证。

[n8n Cloud](https://n8n.io/pricing/) 是内部编排的另一候选：同日 Starter 标价 **€20/月（按年付），每月 2,500 次工作流执行**。它按执行量计费，不是 changedetection.io 的直接替身；自托管 n8n 社区版与 Cloud 的工作流/凭据迁移、对外产品用途仍需单独确认。若后来仅需增加 Galxe 或 X 的 API 配额，属于**接口费用**而非托管迁移，应独立询价。比较付费方案时记录总月费、请求/执行/监看配额、超额规则、可导出数据、历史保留、凭据迁移和内容再发布权；当前没有运行量数据，不能算总拥有成本。

## 用户参考帖的作用

[参考 X 帖](https://x.com/yujuhao/status/2113943584441282682) 是工具网站清单。五个与调研相关的短链已只读解析到 Airdrops.io、ICO Analytics、RootData、DeFiLlama、AirdropAlert；这仅确认跳转地址，未证明这些网站有开放 API、可批量复用数据或其活动可靠。融资、TGE 和链上收入工具更适合作项目背景核对，不自动构成奖励活动证据。

## 推荐的证据边界

每条发现保留原始 URL、来源类型、作者/主办方、发布时间、获取时间和官方活动页；跨平台合并时保留每条原始线索。奖励、截止日、地域与资格、费用、可变现性均以主办方页面为准。信息不足时标记未知，不用积分、NFT 地板价或“无币”推断现金收益。活动已结束、规则变更或来源撤回时重新核对状态。数据源的可访问性、采集许可和配额需在实际接入前逐项复核。
