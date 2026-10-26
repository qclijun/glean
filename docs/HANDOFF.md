# 阶段交接 · 2026-10-26

目标：建立可运行的中文 Web3 奖励活动研究网站，重点关注低门槛、低耗时、低成本和可变现机会。已完成 React/TypeScript/Vite 首版，含响应式列表、筛选排序、收藏、参与清单、收益计算器、评分解释和本地线索草稿。按用户最终确认，将 Ptah Relic（每 ID 最多四枚、可出售）作为首页复盘案例，与 POA 分开；首发已结束，历史价格保留第三方来源标记。

提交：当前目录并非有效 Git 仓库，未创建提交或推送。验证：生产构建通过；5 项逻辑、6 项浏览器测试通过；1440px 桌面及 390px 手机无横向溢出、无页面运行异常。证据：`/tmp/glean-build.log`、`/tmp/glean-browser-tests.log`、`/tmp/glean-desktop-viewport.png`、`/tmp/glean-mobile-viewport.png`、`/tmp/glean-relic-detail-final.png`；来源见 `docs/research.md`。待办：正式上线前接入采集、审核、实时状态与服务端投稿；当前人工快照、估计耗时、未知收益及本地存储边界已在界面说明。开发服务端口 5173。

## Git 初始化交接

目标：按用户要求将当前网站纳入 Git 管理，并提交首版。使用 main 分支，首个提交包含应用源码、图标、构建配置、依赖锁文件、测试、说明及研究记录。忽略规则排除依赖、构建产物、TypeScript 缓存、测试报告、覆盖率、日志、环境文件、本机凭据与工具目录；保留环境示例模板。验证重点为暂存文件清单、忽略规则匹配、差异空白检查与提交后工作区状态；业务代码未变，沿用上一阶段通过的构建及十一项测试。提交号以 `git log -1 --oneline` 为准，收录范围可用 `git show --stat HEAD` 核对。待办：自动采集和服务端能力仍按上一阶段记录，当前未配置远程仓库，未执行推送。

## 工程技能配置交接

目标：完成用户调用并逐项确认的 Matt Pocock 工程技能初始化。已选 GitHub Issues，目标为 qclijun/glean；新建 AGENTS.md，以三个短入口引用问题跟踪、默认标签、单一上下文领域文档规则。四个配置文件与确认草稿逐项一致，入口引用检查通过；GitHub 的 needs-triage、needs-info、ready-for-agent、ready-for-human、wontfix 五个标签已核验齐全，保留原有其他标签。领域术语表和 ADR 约定按需产生，当前配置未预填术语或决策。远程 origin 已绑定，首版提交 59b012c 已同步；本阶段仅提交配置及本交接记录，沿用此前同步 main 的授权。证据为 docs/agents/ 下三份配置、/tmp/glean-setup-verification.json 与 GitHub 标签列表。业务代码未变，无需重跑应用测试；后续可直接编辑配置，切换跟踪系统时再重跑 setup。

## README 与项目简介交接

目标：补充 README，并按用户追加要求设置项目 description。README 现含产品定位、现有功能、快照与本地草稿边界、安装运行、构建预览、来源核验、Relic/POA 区别、评分上限、收益公式、数据维护、测试及 GitHub Issues 协作入口。GitHub 仓库简介和 package.json 的 description 使用同一句中文定位。验证：十八处本地文档链接有效，命令对应 package.json 脚本，Markdown 代码块闭合，包文件与锁文件依赖一致，生产构建通过；只改文档与元数据，未重复运行浏览器测试。证据：README.md、/tmp/glean-readme-verification.json、/tmp/glean-readme-build.log 及 GitHub 仓库简介读回结果。本阶段提交范围为 README、package.json 和交接记录，沿用同步 main 的授权。自动采集、后端投稿与实时买盘仍列为后续能力，未在文档中宣称已经实现。

## 内部线索收集交接

目标：按用户确认的 CLI 边界，交付首个只读内部线索收集功能。本阶段提交见 `git log -2`；新增可配置的 RSS/Atom 官方来源抓取命令、30 天回看、稳定 URL 去重和本地待核验 JSON 队列，输出目录被 Git 忽略，公开活动快照未改。证据见 `tests/collect-leads.test.ts`、`tools/collect-leads.mjs`、`config/lead-sources.json` 和 README 的“内部线索队列”；本地样本先红后绿，`npm test` 八项、构建和 Playwright 六项均通过。官方 Ethereum feed 冒烟首次收集五条，重跑新增零条；这些条目只是未核验线索，当前订阅源包含与奖励无关的文章。审查发现并补测了空 RSS/Atom 源正常返回零条。待办：人工核验并扩充定向官方源，再评估误报和召回；没有自动发布、社交平台抓取或定时运行。

## Galxe 已知 Space 线索收集交接

目标：依据工单 03 的平台调研，把官方 Galxe Quest API 的已知 Space 读取接入现有内部 CLI，不推断全站覆盖。配置增加可选 `galxeSpaces`；运行者在环境变量提供访问令牌后，命令分页读取 Active 和 NotStarted 任务，把任务页链接、来源和发现时间写入原有待核验 JSON 队列，并保持重复运行去重。提交见本阶段 `git log -1`；证据见 `tools/collect-leads.mjs`、`tests/collect-leads.test.ts`、`config/lead-sources.json` 与 README。测试以本地模拟 GraphQL 两页数据先红后绿，并补测缺 token 时抓取前失败、原队列保留。默认 RSS 实源冒烟新增零条；当前环境没有 Galxe token，因此未实测其线上鉴权和数据。待办：用户配置已知 Space 与令牌后做真实只读冒烟，再人工核验线索质量；未接入需要管理员权限的 Zealy 任务接口。


## 公开公告/RSS 采集交接（#4）

目标：按用户确认的工单 #4 范围补齐公开公告/RSS 采集，复用内部 CLI。实现提交 `8547a0f`：增加实测可读的 Arbitrum 博客源，保留 Ethereum；新条目保存 GUID/Atom ID、作者、更新时间及可选原网站/频道地址，支持仅以 permalink GUID 提供链接的 RSS，并提供公开频道 RSSHub 配置说明。验证：两条新能力测试先红后绿，采集器八项、全量逻辑十三项、浏览器六项及构建、应用与测试类型检查通过。隔离队列实源首次七条，重跑字节不变；证据见 `/tmp/glean-04-verification.json`、`/tmp/glean-04-smoke-summary.json`。规范审查无必须修复项，仅建议以后提取重复测试夹具；规格审查无问题，报告见 `/tmp/glean-04-review-standards.md`、`/tmp/glean-04-review-spec.md`。后续按需配置真实 RSSHub 实例与频道；本轮仅本地模拟其 feed，未实测线上实例。普通博客条目仍需人工核实，旧队列不回填元数据，同 URL 编辑不覆盖首次记录；使用方式和来源限制见 `docs/lead-sources.md`。
