# 公开公告与 RSS 线索

依据 [工单 #4](https://github.com/qclijun/glean/issues/4) 的调研，优先读取项目原生 RSS/Atom；公开社交公告可消费已可读取的 RSSHub feed。沿用内部 CLI，每次执行一次抓取，所有新条目仍为 `unverified`。

## 已配置来源

2026-10-26 只读核验：

| 来源 | Feed | 核验与范围 |
| --- | --- | --- |
| Ethereum Foundation Blog | <https://blog.ethereum.org/en/feed.xml> | 官方博客 RSS，包含生态和资助公告，也有与奖励无关的文章。 |
| Arbitrum Ecosystem Blog | <https://blog.arbitrum.io/rss/> | [博客首页](https://blog.arbitrum.io/)的 RSS alternate 链接指向此地址；实测可读，含 Stablecoin Growth Program 等公告。 |

这两个都是通用博客源，条目不一定涉及奖励。Arbitrum 的 `/tag/grants/rss/` 在此次核验时返回 404，未加入配置。订阅源可能只提供有限历史，30 天窗口不等于完整覆盖近 30 天的全部公告。

## 添加来源

编辑 `config/lead-sources.json` 中的 `feeds`。每项需要稳定且唯一的 `id`、显示用 `name`、HTTP(S) 的 feed `url`；可选 `siteUrl` 保存主办方网站或原始公开频道地址。`siteUrl` 由配置者提供，不自动推断官方身份。

公开 Telegram 频道可使用 RSSHub 的 `/telegram/channel/<username>` 路由。先确认 `https://t.me/s/<username>` 可公开预览，再选择可用的 RSSHub 实例验证 feed。[官方路由源码](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/telegram/channel.ts)说明了路径与频道限制；有些频道需要实例运营者配置 Telegram API，不保证所有公开频道均能读取。

下面是**占位配置**，需替换实例域名与频道名后再使用；默认配置没有加入 Telegram 或公共 RSSHub 实例：

```json
{
  "lookbackDays": 30,
  "feeds": [
    {
      "id": "project-public-announcements",
      "name": "项目公开公告",
      "url": "https://your-rsshub.example.org/telegram/channel/your_public_channel",
      "siteUrl": "https://t.me/s/your_public_channel"
    }
  ],
  "galxeSpaces": []
}
```

将配置保存为独立文件，可以用隔离输出验证后再加入常用来源：

```bash
npm run collect:leads -- --sources /path/sources.json --output /tmp/glean-public-leads.json
```

RSSHub 由所选实例负责生成 feed，Glean 消费其公开 HTTP(S) 输出。此处无需提供社交账号或登录 cookie。确认频道运营者和来源使用条件后，再决定是否长期收集。

## 溯源与重复采集

新条目保留以下信息，缺失的条目元数据保存为 `null`：

| 字段 | 含义 |
| --- | --- |
| `source.url` | 实际配置的 feed 地址，包括 RSSHub 地址。 |
| `source.siteUrl` | 配置者填写的原网站或频道地址；未配置则省略。 |
| `url` | RSS 文章链接或 Atom alternate 链接；RSS 无链接时可使用声明为 permalink 的 GUID（省略 `isPermaLink` 视为 true）。仅接受 HTTP(S)。 |
| `entryId` | RSS GUID 或 Atom ID，保留为文本，包括前导零；不将非 permalink 的 GUID 当作文章地址。 |
| `author` | 条目提供的 `dc:creator`、Atom `author.name` 或 RSS `author`。 |
| `publishedAt` | 发布时间；无发布时间的 Atom 条目沿用 `updated` 作为回看窗口依据。 |
| `updatedAt` | 源条目的 Atom `updated` 或 RSS `atom:updated`；不推断编辑时间。 |
| `discoveredAt` | 首次入队时间。 |

按来源 `id` 和条目 `url` 去重，重复运行保留已有记录及人工备注。修改已有来源 ID 会改变去重身份，应保持稳定。同一 URL 后续编辑不会覆盖首次入队信息；旧队列无需迁移，也不会自动补齐这些新字段。

原帖作者和时间来自 feed，尚未独立核实。转发关系、正文、跳转终点及活动规则由人工回到原始页面核验。全部来源成功后才保存队列；任意来源失败则命令退出非零，现有队列保持不变。

当前通过手动执行 CLI 抓取，未提供定时任务或实时提醒，延迟也受 feed 更新和 RSSHub 缓存影响。X、Discord、Farcaster 需要相应凭证或权限的接口仍按各自接入条件另行评估。
