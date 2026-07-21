---
name: position-launcher
description: 岗位发布器：将内部JD转化为多平台差异化职位描述，通过浏览器自动化发布到BOSS直聘和脉脉，同步更新飞书多维表格和本地缓存，输出闭环报告。当用户需要"发布岗位""发布JD""po职位""post job""上线职位""新岗位发布"或将一份岗位描述发布到招聘平台时触发。也用于"把这个JD发到BOSS和脉脉""更新飞书岗位配置"等场景。
---

# Position Launcher — 岗位发布闭环 Skill

版本：1.2.0 | 更新：2026-06-17（Tab铁律 + 审核状态机 + 脉脉→RBT闭环 + 编码方案 + isTrusted策略）

## 身份定义

Position Launcher 是一个端到端的岗位发布编排器。它接收内部JD文档或岗位需求描述，完成画像对齐 → JD生成 → 平台发布 → 数据同步的完整闭环。

核心职责：
1. 解析内部JD，对齐候选人画像
2. 生成针对不同平台的差异化JD
3. 更新飞书多维表格和本地缓存
4. 通过浏览器自动化发布到BOSS直聘和脉脉
5. 输出结构化闭环报告，衔接RBT进入运营阶段

## 铁律（最高优先级）

### 铁律 1：Tab 隔离
**只控制当前 Tab，不切 Tab、不开新 Tab、不关 Tab。** BOSS 只允许一个网页同时在线，切换 Tab = 破坏会话。RBT 的铁律同样适用此处。

这意味着：
- ❌ CGEvent 点击 —— 屏幕坐标不可靠，可能点到浏览器 Tab 栏或其他窗口，导致页面跳转
- ❌ `window.open()` 或 `location.href` 到非 BOSS 域名 —— 除非用户明确要求切换平台
- ❌ System Events 点击 —— 需要辅助功能权限，且同样有坐标风险
- ✅ 所有交互通过 JS `execute active tab javascript` 完成
- ✅ 跨平台操作（如脉脉）在当前 Tab 内顺序执行，完成后导航回 BOSS

### 铁律 2：审核状态机
**BOSS 职位提交后有审核期，不是即时生效。** 必须识别和跟踪审核状态，而非重复提交。

状态流转：
```
表单提交 → "审核中" → 轮询职位列表 → "开放中" → 设招呼语
                ↘ "审核不通过" → 报告失败原因
```

实现要点：
- 提交后检测弹窗关键词："审核中"、"审核通过"、"审核不通过"
- 若"审核中"：更新缓存状态为"审核中"，启动轮询（每5分钟检查职位列表）
- 职位出现在列表且状态为"开放中"后，自动触发招呼语设置
- 若"审核不通过"：报告原因，等待用户修正
- **禁止**：看到"审核中"后重复提交同一职位

### 铁律 3：脉脉→RBT 闭环
**脉脉发布是可选步骤，不阻塞主流程。** 如果脉脉发布被阻（权限、行业要求等），不应悬停等待，而是完成 BOSS 侧的闭环，输出 RBT 可消费的岗位卡片。

优先级：
1. BOSS 发布 + 招呼语 = 主流程，必须完成
2. 脉脉发布 = 加分项，受阻时降级为"待手动"
3. 飞书 + 缓存同步 = 每次必做
4. 闭环报告必须包含 RBT 就绪声明

## 环境要求

- macOS（AppleScript + Chrome）
- Google Chrome（已登录BOSS直聘企业端）
- Python 3（飞书API同步 + Quartz/CGEvent仅在紧急情况使用）
- 飞书API已配置（APP_ID, APP_SECRET, APP_TOKEN）
- 本地缓存路径：`/Users/blacklake/bosszhibin_cache/bosszhibin_jobs_cache.json`

## 中文编码规范（所有阶段适用）

通过 AppleScript `execute active tab javascript` 传递中文时，**禁止**在 JS 字符串中直接使用中文字符——会被 osascript 破坏编码。

### 正确方案

**方案 A：Unicode 转义（推荐，适合 ≤500 字符的文本）**

在 Python 中将中文转为 `\uXXXX` 序列，写入 JS 文件后通过 `read POSIX file` 执行：

```python
def escape_unicode(text):
    result = []
    for ch in text:
        if ord(ch) > 127:
            result.append(f'\\u{ord(ch):04x}')
        else:
            result.append(ch)
    return ''.join(result)
```

**方案 B：Base64 中转（适合长文本，如 JD）**

Python 端 b64 编码 → 分块写入 JS accumulator → JS 端 atob + decodeURIComponent 解码：

```python
# Python: encode
b64 = base64.b64encode(text.encode('utf-8')).decode('ascii')
# Split into 500-char chunks to avoid AppleScript string limits

# JS: decode
var decoded = decodeURIComponent(Array.prototype.map.call(atob(window.__b64), function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
}).join(''));
```

**方案 C：charCode 匹配（用于 DOM 文本搜索）**

在 JS 中搜索中文文本时，不要用 `textContent.indexOf('中文')`，用 charCode 匹配：

```javascript
// ❌ 编码会被破坏
if (el.textContent === '本科') { ... }

// ✅ charCode 匹配
if (el.textContent.charCodeAt(0) === 26412) { // 26412 = 本
    el.click();
}
```

**方案 D：索引定位（用于下拉选项选择）**

当选项列表固定时，直接用索引选中：

```javascript
// 经验下拉：1年以内[0], 1-3年[1], 3-5年[2], 5-10年[3], 10年以上[4]
var items = doc.querySelectorAll('.ui-select-item');
items[2].click(); // 3-5年
```

## 执行流程

### 阶段 0：启动前检查

```
1. 检查 Chrome 是否运行且当前 Tab 为 BOSS 直聘
   - 通过 osascript 获取当前 Tab URL
   - 若非 zhipin.com → 直接导航到 BOSS
   - 不检查其他 Tab（铁律1）
2. 检查飞书 API 连通性
   - 获取 tenant_access_token 验证
   - 失败 → 降级为仅本地更新
3. 读取现有缓存和飞书岗位配置
   - bosszhibin_jobs_cache.json
   - 飞书 职位配置表（job_configs）
```

### 阶段 1：JD解析与画像对齐

**输入**：内部JD文档或用户口述需求。

**处理步骤**：

1. 提取关键信息：
   - 岗位名称（对内/对外两个版本）
   - 核心职责（5-7条）
   - 必备能力（硬性技术 + AI实践 + 软性特质）
   - 经验年限与背景要求
   - 加分项与排除画像
   - 薪资范围与地点

2. 对齐候选人画像：
   - 如果岗位涉及搜索策略，调用 `talent-sourcing` 生成搜索画像
   - 提取可用于BOSS/脉脉筛选的关键词
   - 识别目标公司池、排除公司、学校要求

3. 生成岗位配置摘要，等待用户确认后再进入阶段2。

### 阶段 1.5：isTrusted 字段预扫描（新增）

在填充表单前，先扫描所有需要 `isTrusted: true` 的字段，列出清单，让用户一次性手动完成。

BOSS 已知 isTrusted 依赖字段：
- **职位类型**（`.job-name-cascader-container`）：Vue cascader，全部 JS 事件无效
- **职位关键词**（`.add-skill` 按钮）：需要真实点击展开标签选择器
- **提交按钮**：部分情况下 `button[type="submit"]` 的 Vue handler 也检查 isTrusted

**策略**：
1. 提前告知用户："表单有 N 个字段需要手动点击，我会先填好其他字段，然后你一次性完成"
2. 填写所有非 isTrusted 字段
3. **isTrusted 预填优化**：对于 `input[name="jobCategory"]`，先用 native setter 填入目标文本值（如"AI产品经理"）。虽然不算正式选中，但用户手动点击级联选择器时，该文本会作为默认搜索词，加速选择
4. 用户手动完成 isTrusted 字段
5. 继续提交流程

### 阶段 2：多平台JD生成

基于内部JD，生成针对不同平台的差异化JD。**核心原则：JD不是面试官手册的缩写，是候选人愿意读的故事。**

#### BOSS直聘版JD要求

- 岗位名 ≤ 15字，包含搜索关键词（如"AI平台工程师"而非"AI原生协作平台工程师"）
- 开篇三行是钩子——候选人在刷列表时看到的前三行决定点击率
- 结构：我们在做什么 → 你会做什么 → 希望你具备 → 为什么你可能想聊一聊
- AI实践写成**必要条件**而非加分项（过滤"对AI感兴趣但没真正用过"的人）
- 去所有内部信息（人员名字、组织安排、内部阻力）
- 薪资范围写具体数字，不写"面议"
- 底部单列技术栈关键词（提升BOSS搜索匹配）
- 字数控制在 500-800 字

#### 脉脉版JD要求

- 标题可直接用岗位名
- 更长的"About this role"段落，强调岗位的交叉性
- 突出自主权、可见影响力和探索空间
- 技术栈和公司描述更详细
- 可包含英文段落（如果面向海归/外企候选人）

### 阶段 3：飞书多维表格同步

使用飞书API更新两张表：

#### 3.1 职位配置表（job_configs）

- TABLE_ID: `tbleye90xxcSDxJE`
- 必填字段：
  - `job_name`：岗位名
  - `priority`：最高/高/中/低
  - `is_active`：true
  - `school_requirement`：985 或 QS100
  - `degree_requirement`：硕士 或 博士（注意：无"本科"选项，PM岗可跳过）
  - `major_requirement`：计算机相关/电子信息/自动化/软件工程
  - `company_prefer`：优先公司，用中文顿号分隔
  - `skill_must`：从可用选项中选择（PyTorch/LLM/RAG/Agent/大语言模型/后训练/多模态）
  - `business_experience`：经验要求和特殊条件
  - `score_threshold`：整数，默认70
  - `last_modified`：毫秒时间戳

- 注意：`degree_requirement` 和 `major_requirement` 仅有技术类选项，PM/非技术岗可跳过不填
- API操作：先查询是否存在同名记录，存在则PUT更新，不存在则POST创建。

#### 3.2 人才寻源策略表（tblBgc3mY9VaSl8T）

- 如果 `talent-sourcing` 生成了搜索策略，回写到该表
- 字段映射见 `references/feishu-config.md`

飞书API配置：
```
APP_ID     = "cli_a92fcce019f9dbd2"
APP_SECRET = os.environ["FEISHU_APP_SECRET"]
APP_TOKEN  = "KmGjw68zrimtfikUvNYcy6AnnBf"
```

### 阶段 4：本地缓存更新

更新 `/Users/blacklake/bosszhibin_cache/bosszhibin_jobs_cache.json`：

新增岗位记录必须包含：
```json
{
  "job_id": "岗位标识（与job_title一致或简化）",
  "job_title": "BOSS上显示的岗位名",
  "status": "开放中",
  "location": "上海",
  "experience": "3-5年",
  "education": "本科",
  "salary": "30-50K",
  "stats": {"views": 0, "contacts": 0, "interests": 0},
  "user_confirmed_requirements": {
    "education_strict": {"undergraduate": "985/QS Top 100", "graduate": "不限"},
    "company_background": {"mandatory": [], "preferred": [...], "excluded": []},
    "skills": [...],
    "special_requirements": [...],
    "threshold_score": 70,
    "priority": "high",
    "experience_allowed": ["3-5年", "5-10年"]
  },
  "last_confirmed": "YYYY-MM-DD",
  "processing_history": [],
  "rule_overrides": {
    "ai_skill_policy": {"keywords": [...]},
    "ui_prefilter_policy": {
      "keyword_tags": [...],
      "experience_override": [...],
      "note": "说明与全局默认的差异"
    }
  }
}
```

**状态字段更新规则**：
- 提交前：`"status": "开放中"`（预期状态）
- 提交后审核中：`"status": "审核中"`
- 审核通过：`"status": "开放中"`
- 审核不通过：`"status": "已驳回"`

**effective_prefilter 字段**（RBT 消费）：
缓存记录中必须包含 BOSS 筛选面板的索引映射，RBT 可直接消费无需猜测：

```json
"effective_prefilter": {
  "boss_filter_indices": {
    "school": [7, 9, 10, 11],
    "keywords": [24],
    "experience": [45, 46],
    "education": [53, 54],
    "exclude": [42]
  },
  "notes": {
    "school": "985[7], 双一流[9], 留学[10], 国内外名校[11]",
    "keywords": "大模型[24]",
    "experience": "3-5年[45], 5-10年[46]",
    "education": "本科[53], 硕士[54]",
    "exclude": "26年后毕业[42] 不勾选"
  }
}
```

筛选索引映射（68个选项，固定编号）：
| 索引 | 标签 | 分类 |
|------|------|------|
| 7 | 985 | 院校 |
| 8 | 211 | 院校 |
| 9 | 双一流院校 | 院校 |
| 10 | 留学 | 院校 |
| 11 | 国内外名校 | 院校 |
| 24 | 大模型 | 牛人关键词 |
| 39 | 在校/应届 | 经验 |
| 41 | 26年毕业 | 经验 |
| 42 | 26年后毕业 | 经验 |
| 43 | 1年以内 | 经验 |
| 44 | 1-3年 | 经验 |
| 45 | 3-5年 | 经验 |
| 46 | 5-10年 | 经验 |
| 47 | 10年以上 | 经验 |
| 53 | 本科 | 学历 |
| 54 | 硕士 | 学历 |

### 阶段 5：BOSS直聘JD发布（浏览器自动化）

#### 5.0 前置：阶段1.5 isTrusted扫描

在填充前告知用户哪些字段需手动点击，填充完其他字段后一次性完成。

#### 5.1 导航到职位管理

```
1. 在当前 Tab 导航到 BOSS 职位管理（铁律1：不切Tab）
2. 点击 "职位管理" 链接
3. 操作对象是 iframe（src="/web/frame/job/list-new"）
```

#### 5.2 打开发布表单

在 iframe 内找到 `.add-btn`（"发布职位"按钮）并点击。

#### 5.3 填充表单（严格遵循编码规范）

**所有中文文本必须使用 Unicode 转义或 Base64 方案。**

1. **职位名称**：`input[name="jobName"]`，Unicode 转义方案
2. **职位描述**：`textarea`，Base64 分块方案（长文本）
3. **经验**：`.ui-select-single`[0]，dropdown[0] 中索引定位
4. **学历**：`.ui-select-single`[1]，dropdown[1] 中索引定位
5. **薪资范围**：BOSS 会自动校准——设完 min 后 max 自动出现，设 max 时可能联动调整 min。**如果 JS click 无法精确控制 max，接受 BOSS 自动值，不反复尝试**
6. **工作地址**：通常自动填充，验证即可
7. **职位类型**（isTrusted）：阶段1.5列入用户手动清单
8. **职位关键词**（isTrusted）：阶段1.5列入用户手动清单

#### 5.4 Boss级联选择器（isTrusted 硬限制）

`input[name="jobCategory"]` 依赖 Vue cascader，**所有 JS 事件被 isTrusted 拦截。CGEvent 对跨域 iframe 无效且会切 Tab（违反铁律1）。**

**唯一正确方案**：阶段 1.5 列入用户手动清单，让用户一次性点击。

#### 5.5 提交与审核状态机

1. 所有字段就绪后，点击 `button.btn-v2[type="submit"]`（不是 DIV.btns.btn-publish）
2. 检测弹窗：
   - "职位审核中" → 更新缓存 status="审核中"，进入审核轮询
   - "同意并继续发布职位" → 点击确认 → 检测结果
   - 错误提示 → 报告并修复
3. **禁止**：看到"审核中"后回到编辑页重新提交（铁律2）

#### 5.6 审核轮询（新增）

提交后若状态为"审核中"：

```
1. 缓存 status 设为 "审核中"
2. 每5分钟检查职位列表：
   - 导航到职位管理 → 检查目标职位是否出现且状态为"开放中"
   - 出现 → 触发阶段 5.7 招呼语设置
   - 仍在审核 → 继续等待
3. 如果用户在轮询期间告知审核通过，立即触发招呼语设置
```

#### 5.7 已知限制（已更新）

- **职位类型**：Vue cascader isTrusted 硬限制，无自动化方案。阶段1.5让用户手动点击
- **职位关键词**：需真实点击 `.add-skill` 展开。阶段1.5让用户手动点击
- 飞书文件上传无法自动化（React portal限制）

### 阶段 5.8：BOSS自定义打招呼语设置（原5.7，已更新）

发布岗位且审核通过后，必须为该岗位设置专属招呼语。

**前置条件**：职位状态为"开放中"（铁律2：审核中无法设招呼语）

**招呼语撰写**：**必须调用 `talent-outreach` skill 生成**，不手写。传入：
- 渠道：BOSS（100字符限制）
- 岗位信息和卖点
- 目标候选人画像
- talent-outreach 的 BOSS 模板：vision开头 → 否定式对比 → 速射信号 → 四字CTA

**自动化步骤**：

1. 导航到工具箱：`https://www.zhipin.com/web/chat/toolbox_v2`
2. 在iframe中找到"自定义打招呼语"行，点击"去设置"按钮
   - 按钮文本为"去设置"，charCode匹配：[21435, 35774, 32622]
   - 点击 `.setting-btn` button（第二个匹配，非 SPAN）
3. 进入招呼语设置页（`/web/chat/set/greeting`，iframe `/web/frame/info/set/greeting`）
4. 点击非 `.select` 的 `.tab-item` 切换到"按职位设置招呼语"
5. 点击 `.greet-job-btn` 中的"添加打招呼语"
6. 在职位列表中找到目标岗位（charCode 匹配），点击选中
7. 填充招呼语 textarea（Unicode 转义方案）
8. 点击"保存"按钮（charCode 匹配：[20445, 23384]）
9. 验证：页面显示"职位：XXX\n[招呼语内容]"

**坐标计算**：`getBoundingClientRect()` 返回视口相对坐标，转屏幕坐标用 `window.screenX/Y + rect.left/top`，不重复加 iframe 偏移。

### 阶段 6：脉脉JD发布

#### 6.1 前置条件

- 当前 Tab 导航到脉脉企业端（`maimai.cn/ent`）
- 导航到职位管理 → 发布职位 → `/ent/v41/positions/add`

#### 6.2 已确认可自动化的操作

- **文本字段**：使用原生setter + input/change事件
- **职位类别（Ant Design Modal）**：mousedown on `.ant-select-selector` → Modal出现 → 点击一级类目（`.firstClass___26MAt`）→ 点击三级类目（charCode匹配"AI"开头+长度=6）
- **工作经验/学历**：mousedown on `.ant-select-selector` → 索引定位 `.ant-select-item`
- **薪资**：`.rc-virtual-list-holder` 控制 scrollTop，30k≈700，50k≈1000

#### 6.3 已知坑（已更新）

| 问题 | 原因 | 方案 |
|------|------|------|
| 中文文本匹配失败 | Ant Design item text 编码 vs JS string 编码不匹配 | **全部改用 charCode 匹配或索引定位** |
| 职位名称反复被清空 | Ant Design Form re-render时React state覆盖DOM值 | 填完所有下拉字段后再填文本字段，立即提交 |
| 行业要求dropdown无法打开 | Ant Design Select的mousedown/click全被拦截 | **仍未解决**——标记为需用户手动 |
| 提交按钮JS click无效 | 按钮为DIV，Ant Design onFinish由内部handler触发 | 使用form submit事件触发校验 |
| 表单重置 | 离开页面后返回，React state丢失 | URL直达避免页面刷新 |

#### 6.4 执行策略

1. 先填所有下拉字段（类别→经验→学历→薪资→周期），全部用 charCode/索引
2. 最后填文本字段（职位名称+描述），用 Unicode 转义
3. 行业要求手动点击
4. 提交

#### 6.5 脉脉受阻时的闭环（铁律3）

如果脉脉发布被拦截（权限、行业要求、自动模式限制等）：

1. **不悬停等待**：立即进入阶段7闭环报告
2. **输出RBT卡片**：明确告知"RBT已就绪，可在BOSS岗位[高级AI产品经理]上执行打招呼和简历处理"
3. **脉脉标记为待手动**：给出清晰的手动步骤

### 阶段 7：闭环报告

任务完成后输出结构化报告。**必须包含 RBT 就绪声明**（铁律3）。

```
【岗位发布闭环报告】
岗位名称: XXX
执行时间: YYYY-MM-DD HH:MM

平台发布状态
- BOSS直聘: ✅ 已发布 / ⚠️ 审核中（轮询中）/ ❌ 失败（原因）
- BOSS招呼语: ✅ 已设置 / ⏸️ 待审核通过后自动设置
- 脉脉: ✅ 已发布 / ⚠️ 待手动（原因）

数据同步状态
- 飞书职位配置表: ✅ 记录ID recXXXX
- 飞书人才寻源策略表: ✅ / ⚠️ 未触发 / ⏭️ 跳过
- 本地BOSS缓存: ✅ 状态=[开放中/审核中]

需人工介入
- [列出所有需要用户手动完成的步骤]

RBT就绪
- BOSS岗位 [岗位名] 已就绪，可执行打招呼和简历处理
- 缓存中包含完整筛选标准（学历/公司/技能/经验）

下一步建议
- BOSS审核通过后招呼语自动设置（轮询中）
- 脉脉：发布后配置搜索轮次（可调用maimai-recruiter）
```

## 核心约束

1. **Tab隔离**：只控制当前Tab，不切、不开、不关（铁律1）
2. **飞书先写，平台后发**：先完成数据同步（可回滚），再做浏览器自动化（不可逆）
3. **禁止CGEvent/System Events**：屏幕坐标不可靠，违反Tab铁律，且跨域iframe无效
4. **审核状态机**：提交后检测审核状态，审核中轮询等待，不重复提交（铁律2）
5. **脉脉→RBT闭环**：脉脉受阻时完成BOSS侧闭环，输出RBT就绪声明（铁律3）
6. **BOSS表单填充后不自动提交**——留给用户检查的机会（isTrusted字段手动完成后提交）
7. **缓存更新使用原子写**：先读→修改→写回，保留完整结构
8. **岗位名在不同平台可以使用不同变体**，但缓存中保持一致
9. **所有中文文本必须Unicode转义或Base64**（编码规范）
10. **BOSS发布时禁止刷新页面**（SPA cold start会丢失已填充的表单数据）
11. **招呼语必须调用talent-outreach生成**，不手写
12. **isTrusted字段在阶段1.5预扫描，一次性让用户手动完成**

## 与现有Skill的关系

- **talent-sourcing**：本skill的阶段1（画像对齐）可能调用talent-sourcing获取搜索策略。上下游关系。
- **talent-outreach**：本skill的阶段5.8（招呼语）必须调用talent-outreach生成消息文案。
- **rbt**：本skill发布岗位后，rbt可以在该岗位上执行打招呼和简历处理。本skill负责"建岗位"，rbt负责"运营岗位"。闭环报告必须声明RBT就绪，并附带 RBT 可消费的 `effective_prefilter`。

**RBT 衔接规范**：启动 RBT 前必须确认用户对岗位的策略偏好：
1. **岗位优先级**：哪些岗位优先打？哪些延后？按什么顺序？
2. **配额分配**：总200次招呼如何分配？（如"新岗位70%，老岗位30%"）
3. **排除岗位**：是否有岗位暂时不打招呼？
4. 确认后写入 RBT 启动参数，不自行决定均匀分配。
- **maimai-recruiter**：本skill在脉脉发布JD后，后续搜索和触达由maimai-recruiter执行。
- **feishu_sync.py**：飞书API写入参考已有的同步脚本配置，但本skill直接调用API。

## 参考文件

- `references/boss-posting-guide.md`：BOSS直聘JD发布表单自动化详细指南
- `references/feishu-config.md`：飞书多维表格字段映射和API操作参考
