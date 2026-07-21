# 飞书多维表格配置参考

版本：1.0.0 | 最后更新：2026-06-12

## API配置

```python
APP_ID     = "cli_a92fcce019f9dbd2"
APP_SECRET = os.environ["FEISHU_APP_SECRET"]
APP_TOKEN  = "KmGjw68zrimtfikUvNYcy6AnnBf"
BASE_URL   = "https://open.feishu.cn/open-apis"
```

## 认证

```python
def get_token() -> str:
    resp = requests.post(
        f"{BASE_URL}/auth/v3/tenant_access_token/internal",
        json={"app_id": APP_ID, "app_secret": APP_SECRET},
    )
    return resp.json()["tenant_access_token"]
```

## 表1：职位配置表（job_configs）

- TABLE_ID: `tbleye90xxcSDxJE`

### 字段映射

| 字段名 | 类型 | 可选值 | 说明 |
|--------|------|--------|------|
| `job_name` | 文本(1) | - | 岗位名称，与BOSS保持一致 |
| `priority` | 单选(3) | 最高/高/中/低 | 岗位优先级 |
| `is_active` | 复选框(7) | true/false | 是否活跃 |
| `school_requirement` | 单选(3) | 985/QS100 | 学校要求 |
| `degree_requirement` | 单选(3) | 硕士/博士 | **注意：无"本科"选项** |
| `major_requirement` | 单选(3) | 计算机相关/电子信息/自动化/软件工程 | 专业要求 |
| `company_must` | 文本(1) | - | 必须具备的公司背景 |
| `company_prefer` | 文本(1) | - | 优先公司，中文顿号分隔 |
| `skill_must` | 多选(4) | PyTorch/LLM/RAG/Agent/大语言模型/后训练/多模态 | **仅限这些选项** |
| `business_experience` | 文本(1) | - | 业务经验和特殊要求描述 |
| `score_threshold` | 数字(2) | - | 评分阈值，整数 |
| `score_weights` | 文本(1) | - | 评分权重配置 |
| `greeting_strategy` | 文本(1) | - | 打招呼策略 |
| `last_modified` | 日期时间(5) | - | 毫秒时间戳 |
| `modified_by` | 用户(11) | - | 修改人 |

### skill_must约束

飞书多选字段的可用选项是**预定义的**，无法动态添加。当前可用选项：
- PyTorch
- LLM
- RAG
- Agent
- 大语言模型
- 后训练
- 多模态

对于非算法岗位（如平台工程师、DevOps），选择最接近的选项（如Agent、RAG、LLM），并在 `business_experience` 字段中补充说明实际所需的完整技能列表。

### API操作示例

**查询记录**：
```python
resp = requests.get(
    f"{BASE_URL}/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records?page_size=20",
    headers={"Authorization": f"Bearer {token}"}
)
```

**创建记录**：
```python
resp = requests.post(
    f"{BASE_URL}/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    json={"fields": record_fields}
)
```

**更新记录**：
```python
resp = requests.put(
    f"{BASE_URL}/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/{record_id}",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    json={"fields": record_fields}
)
```

## 表2：人才寻源策略表

- TABLE_ID: `tblBgc3mY9VaSl8T`

### 字段映射

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `job_name` | 文本 | 关联的岗位名 |
| `is_active` | 复选框 | 是否启用 |
| `strategy_version` | 数字 | 策略版本号 |
| `persona_summary` | 文本 | 候选人画像摘要 |
| `noise_summary` | 文本 | 噪声人群描述 |
| `strategy_rationale` | 文本 | 策略依据 |
| `target_titles` | 文本 | 目标职位title |
| `target_companies` | 文本 | 目标公司列表 |
| `target_orgs` | 文本 | 目标组织/部门 |
| `keyword_core_cn` | 文本 | 核心中文关键词 |
| `keyword_expand_cn` | 文本 | 扩展中文关键词 |
| `keyword_negative` | 文本 | 负向排除词 |
| `evidence_signal` | 文本 | 证据信号 |
| `search_rounds_json` | 文本 | 搜索轮次JSON |
| `primary_rounds_summary` | 文本 | 主轮次摘要 |
| `maimai_strategy` | 文本 | 脉脉渠道策略 |
| `next_iteration_hint` | 文本 | 下次迭代提示 |
| `last_modified` | 日期时间 | 最后修改时间 |

### 写入时机

1. `talent-sourcing` 生成新策略 → 创建新记录，`strategy_version=1`
2. 已有策略但做了显著调整 → 更新记录，`strategy_version+1`
3. 飞书写入失败 → 降级保存为本地JSON：`/Users/blacklake/multi_platform_cache/strategy_<job_name>_<日期>.json`

## 同步脚本

已有脚本路径：`/Users/blacklake/feishu_sync.py`

该脚本负责将 `bosszhibin_jobs_cache.json` 批量同步到飞书。本skill直接调用API而非通过该脚本，以保证字段级精确控制。

## 错误处理

| 错误 | 处理 |
|------|------|
| Token过期 | 重新获取（token有效期2小时） |
| 记录已存在 | PUT更新而非POST创建 |
| 字段值不在可选范围 | 跳过该字段，记录warning |
| API限流 | 等待2秒重试，最多3次 |
| 网络不可达 | 降级为仅本地操作 |
