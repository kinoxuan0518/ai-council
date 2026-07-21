# Targeted Talent Hunting Output Schema

Use this schema for full reports. Keep the report result-oriented. A recruiting map is a
market and people artifact first; architecture understanding supports candidate decisions but
does not replace market coverage, org/team mapping, or actionability.

## 1. Mapping Scope

```yaml
target_seed:
  type: company_set | project | paper | people_group | fuzzy_profile
  raw_input:
map_type: talent_map | market_map | org_map | architecture_map | hybrid
target_theme:
role_or_function_scope:
seniority_or_stage_scope:
geography_scope:
target_company_or_project_universe:
time_horizon:
coverage_goal:
coverage_claim: complete | partial | pilot | architecture_led_lead_map
strong_match:
acceptable_transfer:
negative_signal:
stop_rule:
```

## 2. Market / Org Map

Use this before the candidate table. The goal is to define the relevant talent market,
where talent sits, and how complete the current map is.

```markdown
| cluster | target company/project/lab | why in scope | visible team/function | likely relevant roles | people found | coverage | next gap |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  | high / medium / low / unknown |  |
```

## 3. Architecture Map

Use this before candidate ranking when the target is a product, project, lab, or technical
community. The goal is to understand how the target works, then place people on that map.

```markdown
| layer | visible architecture | evidence | people / nodes | relevance to hiring | confidence |
|---|---|---|---|---|---|
| product workflow |  | confirmed / inferred / to_verify |  |  | high / medium / low |
| model capability |  |  |  |  |  |
| agent / orchestration |  |  |  |  |  |
| data / asset layer |  |  |  |  |  |
| tooling / integration |  |  |  |  |  |
| evaluation / quality loop |  |  |  |  |  |
| team / org |  |  |  |  |  |
| ecosystem / open source |  |  |  |  |  |
```

Architecture evidence rules:

- `confirmed`: directly stated by official pages, repos, demos, papers, personal pages, or commits.
- `inferred`: follows from product behavior, repo structure, public demos, repeated contributor patterns, or linked projects.
- `to_verify`: plausible but not proven; do not use as a strong hiring argument yet.

## 4. Relationship / Expansion Map

Use a table by default. Use Mermaid only when relationship structure matters.

```markdown
| cluster | seed | expansion path | why this cluster matters | status |
|---|---|---|---|---|
|  |  |  |  | active / exhausted / weak |
```

Optional Mermaid:

```mermaid
graph LR
  "Seed project/company" --> "Core person"
  "Core person" --> "Coauthor / contributor"
  "Core person" --> "Adjacent project"
```

## 5. Candidate Longlist

The longlist is the recruiting map. Include credible non-outreach nodes so the map remains
useful after the first outreach batch.

```markdown
| map_status | priority | name | current org/title | location | seniority/stage | architecture/team position | evidence | match | contact path | availability/receptivity signal | prior contact/dedup | confidence | next action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| candidate / map_node / team_account / warm_path / skip | P0/P1/P2/watch |  |  |  |  | model / product / infra / workflow / ecosystem / founder / GTM / map_node |  | strong / transferable / weak | email/site/GitHub/Scholar/LinkedIn/X/warm path | none / inferred / confirmed | unknown / no / yes | high/medium/low | email / warm intro / verify / skip |
```

## 6. Action Shortlist

```markdown
| action_rank | name | action | why now | message angle | risk / missing check |
|---|---|---|---|---|---|
| 1 |  | direct email / LinkedIn / warm intro / verify first |  |  |  |
```

## 7. Candidate Evidence Card

Use one card for each P0 and important P1 candidate.

```yaml
name:
current_org:
current_title:
location:
seniority_or_stage:
architecture_position:
role_depth: lead | core_contributor | coauthor | maintainer | advisor | peripheral | team_account | unclear
priority: P0 | P1 | P2
match_to_theme: strong | transferable
contact:
  email:
  personal_site:
  github:
  scholar:
  linkedin:
  x:
  warm_path:
availability_or_receptivity:
prior_contact_or_dedup:
confirmed:
  - fact with source URL
inferred:
  - judgment and why it follows
to_verify:
  - open question or missing evidence
why_this_person:
why_now:
outreach_angle:
next_action:
confidence:
```

## 8. Contact Path Rules

- `email`: use only when found from a public page, paper, GitHub profile, company page, or prior internal record.
- `personal_site`: preferred when email is absent because it often links to other channels.
- `GitHub`: useful for builders and contributors; capture username and repo evidence.
- `Google Scholar`: useful for research-heavy profiles; capture author page if identity is clear.
- `LinkedIn/X`: useful for current role and warm-path checks; label as unverified if not directly opened.
- `warm_path`: list shared company, coauthor, advisor, investor, colleague, or internal referrer path if visible.

## 9. Coverage Audit

```markdown
| dimension | status | evidence | gap | next step |
|---|---|---|---|---|
| target market boundary | clear / partial / unclear |  |  |  |
| target company/project coverage | high / medium / low |  |  |  |
| org/team structure | high / medium / low |  |  |  |
| named people coverage | high / medium / low |  |  |  |
| contactability | high / medium / low |  |  |  |
| actionability | high / medium / low |  |  |  |
| refreshability / CRM readiness | high / medium / low |  |  |  |
```

## 10. Confidence Definitions

```yaml
high:
  definition: identity, target-theme evidence, and at least one contact path confirmed from reliable sources
medium:
  definition: identity and target-theme evidence clear, but contact path or role depth incomplete
low:
  definition: possible fit, but identity, role depth, or contactability still requires verification
```

## 11. Final Summary

```markdown
- map type and coverage claim:
- target market boundary:
- best-covered clusters:
- under-covered clusters:
- architecture read:
- candidate longlist count:
- P0/P1 candidates:
- P2 / watch nodes:
- direct email count:
- non-email contact path count:
- key evidence and coverage gaps:
- recommended next search expansion:
```
