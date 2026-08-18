# 🎴 谈薪物语

沉浸式谈薪谈判模拟（Gal Game 形式）。你扮演 **HR** 或 **候选人**，大模型扮演你的对手，全程打字自由对话、按住 `Fn` 语音对话，谈崩自动复盘原因、谈成帮你拆解你最在意的点。

> 画面为即梦 AI 生成的动漫立绘 × 4 角色 × 7 种表情，非纯文字游戏。

## 两种视角

- 💼 **我是 HR**：输入候选人的当前薪资、期望、简历、面试评价、你的预算底牌 → 大模型扮演候选人跟你谈。
- 🧑‍💻 **我是候选人**：输入公司岗位信息、对方卖点、你的情况 → 大模型扮演 HR 跟你谈（可选温和/专业/强势风格）。

每种模式内置 4 个预设案例，一键开局。

## 功能

- 自由打字对话（无选择题）· `Fn` 按住语音 · 对方台词 🔊 TTS 朗读
- 谈判温度计：每轮随对方情绪移动（谈崩边缘 ↔ 一拍即合）
- 结算复盘：成交 → 分析你最在意的点 TOP3 + 谈判风格画像；破裂 → 按时间线还原是哪几句话谈崩的 + 可挽回时机
- 历史对局：每局自动存本机浏览器，可回看对话与复盘（最多 50 局）

## 快速开始

```bash
git clone https://github.com/kinoxuan0518/salary-monogatari.git
cd salary-monogatari
npm install        # 若报错加 --legacy-peer-deps
npm run dev
```

打开 http://localhost:3000 ，点「开始玩」。首次进入在右上角 ⚙️ 选一家模型供应商并填 API Key（推荐 DeepSeek，最容易申请），Key 只存在你自己的浏览器 localStorage，不落仓库、不落服务端。

## 给同事的 Agent 的指令

同事若有 Claude Code / Cursor 等 Agent，直接把下面这段丢给它即可跑起来：

```
帮我把这个公开仓库跑起来，它是一个 Next.js 网页游戏（谈薪模拟器）：

1. git clone https://github.com/kinoxuan0518/salary-monogatari.git
2. cd salary-monogatari
3. npm install（如果报错就加 --legacy-peer-deps 再试一次）
4. npm run dev
5. 打开 http://localhost:3000 确认页面能正常渲染

跑通后把访问地址告诉我。游戏右上角 ⚙️ 里需要选一家大模型供应商并填 API Key（推荐 DeepSeek），填完即可开始玩。
```

## 仓库结构

- `src/app/negotiation/` — 谈薪物语游戏本体
- `src/components/negotiation/` — 游戏组件（立绘、对话框、复盘、历史面板等）
- `src/lib/` — 游戏逻辑与模型供应商配置
- `public/negotiation/` — 立绘与背景素材

## 技术栈

Next.js 14（App Router）· TypeScript · Tailwind CSS · OpenAI 兼容 API（DeepSeek / Kimi / GLM / 千问 / MiniMax）
