---
name: blacklake-targeted-talent-hunting
description: >
  黑湖定向挖猎技能：围绕目标公司/项目/论文/团队/模糊人才画像，构建高精度候选人地图。
  触发关键词："定向挖猎"、"目标人才地图"、"定向mapping"、"挖猎"、"精准挖人"、
  "做人才地图"、"目标公司找人"、"项目级mapping"、"竞品挖人"、"论文作者追踪"、
  "开源项目贡献者挖掘"、"targeted talent hunting"、"talent map"、"candidate mapping"。
  适用场景：针对特定目标公司或项目做深度人才地图，而非日常批量寻源；
  用户要求"画一张XX公司/项目的人才地图"、"帮我挖XX团队的人"、"定向找做XX方向的人"时触发。
  注意：本skill侧重精度优先的定向猎取，与talent-sourcing的广度优先策略寻源不同。
---

# BlackLake Targeted Talent Hunting

Use this skill when Kino wants a focused talent and architecture map, not a generic daily
sourcing batch. The output priority is accuracy first: people, evidence, contact paths,
how the target works, and why each person matters. Visual structure is useful only when it
makes the hunting result clearer.

## Core Intent

Targeted hunting starts from one of these seeds:

- A company set, such as a few AI product companies, labs, industrial software companies, or competitors.
- A project, repo, product, paper, benchmark, dataset, conference cluster, or open-source community.
- A group of known people, such as authors, teammates, founders, contributors, advisors, alumni, or ex-colleagues.
- A fuzzy profile, such as "people who can put CAD agents into real engineering workflows".

The skill has three connected jobs:

- Build a recruitment talent map: the defined talent market, target companies/projects, named people,
  coverage, contactability, and action priority.
- Build a market/org map: where the relevant talent sits, how target teams are structured, which
  companies/projects are feeders, and which warm paths exist.
- Build an architecture map: how the company/project appears to work across product, model,
  data, tools, team roles, and ecosystem dependencies.

Architecture mapping supports recruitment mapping; it is not a substitute for it. Do not stop at
a name list if public evidence can reasonably reveal product architecture,
technical architecture, org architecture, collaborators, coauthors, maintainers, ex-colleagues,
or adjacent projects.

## Recruitment Mapping Standard

In a recruiting context, "mapping" means structured market research, not only sourcing.
A useful map should answer:

- Scope: what role/profile, seniority, geography, company/project universe, and time horizon are being mapped.
- Supply: where the relevant people are concentrated, including target companies, labs, projects, teams, and feeder networks.
- People: named individuals with current org, likely function, seniority/stage, evidence, contact path, and relevance.
- Coverage: how complete the map is for the defined segment, what sources were checked, and what remains unsearched.
- Actionability: who is ready for outreach, who needs verification, who is only a warm path or intelligence node.
- Refresh: whether the map is a one-off snapshot or a reusable CRM asset that should be refreshed.

If these are missing, label the output as a `pilot map`, `partial map`, or `architecture-led lead map`,
not a complete talent map.

## Operating Principles

- Default to dense output. Prefer tables, short labels, and action fields over explanatory prose.
- Do not explain the mapping framework unless the user asks. Show the map.
- Strong relevance beats transferable relevance.
- Accuracy beats aesthetics, volume, and clever framing.
- Evidence quality beats title quality.
- Market boundary beats unbounded expansion. A map of "interesting people" is not a recruiting map until
  the target market and coverage goal are explicit.
- Separate the longlist from the shortlist. A map should retain credible non-outreach nodes instead of
  only showing the few people ready to email.
- Prefer candidates with direct evidence of the target theme over people who merely have adjacent prestige.
- Candidate value depends on architecture position: product owner, model builder, infra/tooling owner,
  workflow designer, open-source maintainer, growth/distribution node, advisor, or peripheral contributor.
- Contactability is part of the result: email, personal site, GitHub, Google Scholar, LinkedIn, X, project page, or a plausible warm path.
- Do not hide uncertainty. Split evidence into `confirmed`, `inferred`, and `to_verify`.
- Treat team, org, lab, or shared project accounts as map nodes or contact paths, not person candidates, unless a public source clearly identifies the individual behind the account.
- Do not overstate architecture. If a layer is inferred from product copy, repo structure, demos, or public talks, label it as inferred.
- If using confidence labels, define them in the output. Use:
  - `high`: identity, target-theme evidence, and at least one contact path are confirmed from reliable public sources.
  - `medium`: identity and theme evidence are clear, but contact path or role depth is incomplete.
  - `low`: possible fit, but identity, contribution depth, or contactability still needs verification.

## Workflow

1. Interpret the seed.
   - Identify whether the seed is company-led, project-led, paper-led, people-led, or fuzzy-profile-led.
   - Convert fuzzy language into concrete evidence signals before searching.
   - If the user gives multiple seeds, keep them as separate clusters instead of flattening them.

2. Define the mapping scope.
   - Define role/profile, seniority or stage, geography, target company/project universe, and time horizon.
   - Define the desired output type: `talent_map`, `market_map`, `org_map`, `architecture_map`, or a hybrid.
   - State the coverage goal. Examples: "top 20 named people", "core team only", "20-50 target companies",
     "80% coverage of public contributors", or "pilot map where completeness is not claimed".

3. Define the target theme.
   - Write a one-paragraph target definition.
   - List `strong_match`, `acceptable_transfer`, and `negative_signal`.
   - For BlackLake AI roles, prefer people who can connect AI/model/agent capability to real industrial, engineering, data, workflow, or product systems.

4. Build the market and org map.
   - List target companies/projects/labs and why each belongs in scope.
   - Identify target teams, functions, roles, seniority bands, geography, and feeder networks where visible.
   - Capture org intelligence separately from candidate recommendations.

5. Expand the candidate map.
   - Start from the seed cluster.
   - Expand first-degree links: authors, core contributors, founders, maintainers, team members, advisors, lab members, and direct collaborators.
   - Expand second-degree links only when they improve relevance: same project lineage, repeated coauthorship, fork/PR relationship, shared lab/company, or adjacent project solving the same problem.
   - Stop when additional expansion produces mostly weak transferable matches or duplicate names.

6. Map the architecture.
   - Identify the visible product workflow: user input, workspace/canvas, generated artifact, review/edit loop, export/integration, or collaboration flow.
   - Identify the visible technical layers: model capability, orchestration/agent loop, tools/APIs, data/asset layer, evaluation/quality control, deployment surface.
   - Identify the team architecture: product/founder nodes, model/research nodes, engineering/tooling nodes, design/workflow nodes, open-source/community nodes.
   - Link people to architecture nodes when evidence supports it.
   - Mark each architecture claim as `confirmed`, `inferred`, or `to_verify`.

7. Verify candidates.
   - Cross-check identity across at least two sources when feasible.
   - Separate confirmed facts from inferred judgments.
   - Capture recruiting fields when available: current title/org, location, seniority/stage, tenure,
     prior companies, education, public contact, warm path, likely availability/receptivity signals, and prior-contact status.
   - Capture role depth: lead/core contributor, coauthor, maintainer, advisor, peripheral contributor, or unclear.
   - If the source is a shared account, label it as `team_account` and use it only as a route into the cluster.
   - Deduplicate against known tracking tables or prior local reports when the task context provides them.

8. Rank for action.
   - Prioritize `P0`, `P1`, `P2`, not a broad star-only pool.
   - `P0`: strong match, clear role depth, contactable, worth high-touch outreach.
   - `P1`: strong or near-strong match, contactable or reachable, worth normal outreach.
   - `P2`: useful map node, referral path, future watch, or needs verification before outreach.
   - Prefer candidates who sit on critical architecture nodes over candidates with generic prestige.

9. Produce the result.
   - Default to a mapping scope, market/org map, architecture map, candidate longlist, action shortlist, and coverage gaps.
   - Include contact information or contact path for each candidate.
   - Include "why this person" and "match to theme" for each candidate.
   - Include "architecture position" for each candidate or map node.
   - Include coverage and confidence: what is well covered, what is not covered, and whether the result is a complete map or a partial/pilot map.
   - Include a "next action" field: direct email, LinkedIn/X, warm intro path, verify first, skip for now.

10. Build the interactive HTML deliverable.
    - Use the template pattern from [html-template.md](references/html-template.md).
    - The HTML is a single self-contained file with two tabs.
    - Mind map tab: collapsible `<details>` tree, color-coded, searchable. No JS dependencies.
    - Report tab: tables, P0/P1 cards, org chart, timeline, project links, next actions.
    - Open the HTML in the default browser after creation (`open file.html`).
    - Save alongside a `.md` version on the Desktop for reference.

11. Execute next actions (if user asks).
    - GitHub API contributor mining: curl repos + contributors endpoints.
    - Deep-dive on newly surfaced candidates found in step 10.
    - Update the HTML with any new findings from this round.
    - Re-open the updated HTML.

## Source Preference

Use public and verifiable sources first. Prioritize depth over breadth — a few high-quality
sources with concrete evidence beat many low-quality mentions.

### Primary Sources

- **GitHub API**: Fetch repo lists, contributor stats, commit history. Use `curl` + GitHub REST API
  to mine contributor identities, commit counts, and email patterns.
- **arXiv / OpenReview**: Paper author lists, technical reports. Extract full author rosters from
  multi-author papers (e.g., Seed1.5-VL had 200+ authors) to surface mid-level researchers.
- **Google Scholar / Semantic Scholar**: Citation counts, co-author graphs, publication timelines.
- **Personal pages / GitHub profiles**: CVs, project pages, contact info. Many researchers expose
  email, resume PDF, and project links on their personal sites.

### China Tech Company Sources

For Chinese targets (ByteDance, Alibaba, Tencent, etc.), these are essential:

- **晚点 LatePost** (latepost.com): Best source for org changes, executive moves, team restructuring.
- **36氪** (36kr.com): Good for funding, spin-offs, talent market dynamics.
- **量子位** (qbitai.com): Technical team deep-dives, "key N people" features.
- **机器之心** (jiqizhixin.com): AI research coverage, paper summaries.
- **百度百科**: Quick org overviews and leadership lists (verify against other sources).
- **脉脉** (maimai.cn): Current titles and tenure for individual verification.

### Cross-Verification Rules

- Identity: cross-check across at least two sources (paper author + GitHub + media mention).
- Org intelligence: prefer 晚点/36氪 for structural changes; verify with job postings.
- Contact info: only use emails found on public pages, papers, GitHub profiles, or personal sites.
  Never invent or guess email addresses.

When live web access is unavailable, use local artifacts and memory only as fallback, and label
the result as stale or unverified if it depends on older snapshots.

## Output Shape

### Primary Deliverable: Interactive HTML

**Always produce an interactive single-file HTML as the primary deliverable.** The HTML has
two tabs users can switch between:

**Tab 1: 思维导图 (Mind Map View)**
- Pure HTML/CSS collapsible tree using `<details>` / `<summary>` elements.
- Zero JavaScript dependencies — no CDN, no library loading issues.
- Color-coded priority dots: 🟢P0 · 🔵P1 · ⚪P2 · 🟣新加入 · 🔴已离职 · 🟠风险信号.
- Search bar with highlight + scroll-to-match.
- Expand-all / collapse-all buttons.
- Compact single-line-per-node format with name, tag, detail, and contact inline.
- Designed for quick scanning and drill-down.

**Tab 2: 详细报告 (Detailed Report)**
- Tables for leadership, by-direction candidate lists, departed personnel.
- P0/P1 candidate cards with contact links (email, personal site, GitHub, Scholar).
- Org chart as monospace tree diagram.
- Timeline of key organizational changes.
- Open-source project table with GitHub links.
- Next Actions checklist.

**HTML template reference**: See [html-template.md](references/html-template.md) for the
full CSS and structure pattern to adapt for each new target.

### Markdown Output

Also save a `.md` version to the user's Desktop for reference and sharing.
Use [output-schema.md](references/output-schema.md) for the structured data model.

### Quick Interactive Answers

For quick responses before the full HTML is ready, use this compact text format:

1. Mapping scope and coverage claim
2. Market/org map
3. Architecture map
4. Candidate longlist and action shortlist
5. P0/P1 action list
6. Evidence and coverage gaps

## Non-Goals

- Do not generate a generic list of 15 people unless the user explicitly asks for a fixed-size batch.
- Do not optimize for pretty charts before the candidate facts are correct.
- Do not call an output a full talent map when it only contains a few lead candidates and architecture notes.
- Do not treat "famous company" or "good title" as evidence by itself.
- Do not over-rank transferable candidates when strong-match candidates exist.
- Do not invent email addresses or contact paths. If unknown, write `not found` and suggest a verification route.
- Do not directly send messages, create email drafts, or update tracking tables unless the user asks for execution after the map is reviewed.

## Handoff

When the user approves outreach:

- Hand off candidates and evidence to `blacklake-ai-talent-sourcing` for Feishu tracking, email generation, and draft persistence.
- Keep the target-map report as the source of the "why this person" field.
- Preserve evidence and uncertainty in notes so later follow-up does not overstate confidence.
