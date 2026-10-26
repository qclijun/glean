# 奖励线索：社交媒体与官方公告的只读收集方案

研究快照：2026-10-26。对应 [issue #4](https://github.com/qclijun/glean/issues/4)。这里只评价线索收集与溯源，不代表活动可参与、奖励可兑现或工具已在本项目部署。渠道价格、访问权限和活动状态应在使用时重查。

## 结论

以项目自己发布的规则页、活动页和官方公告作为核验终点。社交帖只生成待核验线索；记录原帖链接、作者、发布时间、抓取时间、转发关系和跳转后的项目页面。对于现金收益、名额、截止时间、地域限制和链上成本，只有一手页面明确写出才能升级为已核实。这个分层是基于下面案例的研究建议，并非已有系统能力。

| 渠道 | 已存在的只读收集方式 | 访问与延迟 | 主要漏报、误报及溯源 |
| --- | --- | --- | --- |
| 官方博客、原生 RSS/Atom | 有 feed 时用开源 [n8n RSS Feed Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.rssfeedreadtrigger/) 定时读取；无 feed 时可用开源 [changedetection.io](https://github.com/dgtlmoon/changedetection.io) 监视活动页，并按页面规则过滤变化。 | n8n 源码标明 polling，实际延迟取决于抓取间隔及源站更新时间；不能承诺实时。[源码](https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/nodes/RssFeedRead/RssFeedReadTrigger.node.ts) | 页面改版、广告和动态计数易触发误报；无发布日期、feed 缺项或限流可能漏报。保留原始 URL、feed item GUID/发布日期与页面快照。官方活动页可直接给出参与条件，例如 [BNB Chain Set and Earn](https://www.bnbchain.org/en/blog/set-and-earn-hire-and-build-ai-agents-on-bnb-chain-win) 规定任务、前 100 钱包及仅实物奖励。 |
| Telegram | 对公开频道可用开源 [RSSHub 的频道路由](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/telegram/channel.ts)，由 `t.me/s/<频道>` 产生 RSS；自有或获准加入的频道也可用官方 Bot API 的 `channel_post`、长轮询或 webhook。[Bot FAQ](https://core.telegram.org/bots/faq)、[Bot API](https://core.telegram.org/bots/api) | Bot 只能收到其所在频道消息；待取更新最多保留 24 小时。RSSHub 的公开预览路线是轮询，其延迟取决于缓存和抓取周期；部分频道受 Telegram 限制，路由作者建议自建并配置 Telegram API。[路由说明](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/telegram/channel.ts) | 转发频道可能重复或删改帖；保留 `t.me/<频道>/<消息 ID>`、原频道及编辑时间。Bot API 不能用来读取任意未加入频道的历史。 |
| Discord | 官方 [Channel Following](https://support.discord.com/hc/en-us/articles/360028384531-Channel-Following-FAQ) 可把其他服务器已发布的公告转入自有服务器；若获准在源服务器安装 bot，可用 Gateway 消息事件或 [Get Channel Messages](https://docs.discord.com/developers/resources/message)。 | Following 要求源频道支持 Announcement、目标端有 Manage Webhooks 权限，源管理员还须发布消息；不是跨服务器全文监听。API 要有频道可见及历史权限；读取正文还受 `MESSAGE_CONTENT` 特权 intent 约束。[消息文档](https://docs.discord.com/developers/resources/message)、[Gateway](https://docs.discord.com/developers/events/gateway) | 只收到已发布公告会漏掉草稿或未 crosspost 的消息；无正文权限会产生空内容。留源服务器/频道/消息 ID，转入副本只作索引。开源 [RSSHub Discord 路由](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/discord/channel.ts) 要求浏览器 `DISCORD_AUTHORIZATION`，不宜用作无需授权的公开采集。 |
| Farcaster | 托管服务 [Neynar cast search](https://neynar.readme.io/reference/search-casts) 支持关键词、日期、作者 FID、频道与游标；[Neynar Webhooks](https://neynar.com/products) 可做实时事件通知。开源官方 [Snapchain](https://github.com/farcasterxyz/snapchain) 自建节点可读协议数据。 | Neynar API 需 API key，额度和价格须按使用时账单核对。Snapchain README 列出 16 GB RAM、4 核、1.5 TB 存储，需同步，部署成本高于托管查询。查询/ webhook 的实际端到端延迟未测量。 | 关键词会命中玩笑、投机及转述；用户名可变，保留 cast hash、FID、频道、原帖链接及嵌入链接。项目活动仍回溯项目站点。 |
| X | 官方 [Recent Search](https://docs.x.com/x-api/posts/search/introduction) 查询过去 7 日；[Filtered Stream](https://docs.x.com/x-api/posts/filtered-stream/introduction) 按规则推送公开帖，适合关注项目账号和奖励关键词。 | 要开发者凭证及可用访问层级；全历史搜索限 pay-per-use/Enterprise。官方称 Filtered Stream P99 约 4–5 秒，属于平台交付指标，**不是**本方案实测告警延迟。API [速率表](https://docs.x.com/x-api/fundamentals/rate-limits) 仍需与账户额度一起核对。 | 搜索窗口、断流、规则过宽/过窄及删帖会漏报或误报；保存 post ID、作者 ID、时间、匹配规则与原链。没有凭证时不能将网页抓取或 RSSHub 的 X 路由当作稳定覆盖证明。 |

## 公开社交讨论回溯

1. 社区作者在 [Binance Square 帖文](https://www.binance.com/en/square/post/379304408321227) 介绍 Agent ID 免费领取并催促抢注。这是公开的第三方社交线索，不是奖励规则。回看 [Binance Wallet 官方 Telegram 公告](https://t.me/binance_wallet_announcements/1892)，官方确实称 Agent ID 可免费领取、先到先得；但公告没有承诺现金收益。[Binance Agentic Wallet FAQ](https://www.binance.com/en/support/faq/detail/3ff00e2d488a41c4aaa4aabb6fc36763) 说明创建钱包免费，链上操作可能产生服务费。因此线索只能标为“免费身份领取”，不能标为“零成本可变现奖励”。
2. 公开 Telegram 社区频道 [Mendadak Crypto](https://t.me/s/mendadakxcrypto) 提到 `AGNT Weekly Socials | S4 Week 4`，指向 [AGNTHub 创建的 Galxe Quest](https://app.galxe.com/quest/AGNTHub/GCNxbtZHj6)。项目活动页显示任务和 Points，但页面上没有现金奖励承诺；社区频道的“任务”帖不能被自动升级为可变现奖励。该频道单帖直链为 `https://t.me/mendadakxcrypto/27458`，网页工具读直链时返回 cache miss，正文依据来自可见的频道预览，因此这条只用作可追溯线索示例。

## 取舍与后续核验

- 优先订阅项目原生 feed 或官方活动/规则页面；官方 Telegram 公开频道可用 RSSHub 作为补充。n8n 和 changedetection.io 都是现成软件，但还需逐站检查 feed、HTML 选择器和频率，不能把工具存在等同于来源覆盖。
- Discord 先用官方 Announcement Following；需要源频道正文时申请合规 bot 权限。Farcaster 从 Neynar 查询/API 小样本验证开始；自建 Snapchain 仅在吞吐或数据所有权值得其机器成本时考虑。X 在取得官方 API 访问和预算后再评估；研究阶段无实测召回率、告警延迟或误报率。
- 所有候选至少保留 `source_url`、`source_type`、`author_id`、`published_at`、`fetched_at`、`canonical_project_url`、`claim_text`、`verification_status`。同活动跨平台合并时以项目活动 URL 和规则版本为准，保留每条原始消息作证据。过期、资格不明、只有积分或实物奖励的线索应保持相应状态，不能推断可提现收益。

## 参考帖后续核验

2026-10-26 经用户要求，用其已连接的 Chrome 会话通过 Agent Reach 所依赖的 OpenCLI 只读适配器取得[原帖](https://x.com/yujuhao/status/2113943584441282682)正文。作者为 `yujuhao`，发帖时间为 2026-10-24 10:40 UTC；正文是“几个撸毛常用网站和工具”的清单，涵盖空投项目、TGE 时间、融资、链上收入、批量生成钱包、批量查询空投、指纹浏览器、IP 购买、钱包安装和项目表格。它附一张图片，正文链接均显示为 `t.co` 短链；本轮未解析短链终点，也未核验所列工具。它是拓展候选来源的社交线索，不是活动数据质量或工具安全性的证明。先前 Agent Reach 专用浏览器缺 X 登录态返回 `NEED_LOGIN`，公开网页返回 403；改走用户 Chrome 后已成功读取。
