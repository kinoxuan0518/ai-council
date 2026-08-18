// 谈薪物语 —— 谈薪模拟 Gal Game 核心逻辑
// 类型定义 / 预设案例 / 角色提示词 / 情绪标记协议解析

export type GameMode = 'hr' | 'candidate'; // 玩家扮演的角色
export type Difficulty = 'friendly' | 'standard' | 'tough';
export type CharacterVariant = 'candidateF' | 'candidateM' | 'hrF' | 'hrM';
export type Expression =
  | 'neutral'
  | 'happy'
  | 'angry'
  | 'thinking'
  | 'surprised'
  | 'sad'
  | 'smug';

export interface PersonaSetup {
  mode: GameMode;
  difficulty: Difficulty;
  npcName: string;
  npcVariant: CharacterVariant;
  npcTitle: string; // 名牌副标题，如「候选人 · 高级前端工程师」
  // 模式 hr：AI 扮演候选人
  candidateCurrent?: string;
  candidateExpect?: string;
  resume?: string;
  interviewNotes?: string;
  hrBudget?: string; // 玩家(HR)的底牌
  // 模式 candidate：AI 扮演 HR
  companyInfo?: string;
  jobInfo?: string;
  hrBudgetRange?: string; // 对方公司的底牌
  companySelling?: string;
  playerResume?: string; // HR 已掌握的玩家资料
}

export interface NpcMeta {
  emotion?: string;
  tempDelta?: number;
  action?: string;
  end?: 'deal' | 'break';
  endCondition?: string;
}

export interface Round {
  id: string;
  role: 'player' | 'npc' | 'system';
  text: string; // 展示文本（已剥离标记）
  raw?: string; // NPC 原始输出
  meta?: NpcMeta;
  hidden?: boolean; // 导演指令，不展示
}

export interface GameSettings {
  provider: string;
  model: string;
  apiKey: string;
  ttsEnabled: boolean;
  voiceAutoSend: boolean;
}

export const SETTINGS_KEY = 'negotiation-game-settings';

export const DIFFICULTY_LABEL: Record<Difficulty, { label: string; desc: string; emoji: string }> = {
  friendly: { label: '温和', desc: '坦诚好说话，容易松动', emoji: '🌤️' },
  standard: { label: '标准', desc: '有来有回，讲道理', emoji: '⛅' },
  tough: { label: '强硬', desc: '精明强势，寸土必争', emoji: '🌩️' },
};

// ---------- 预设案例 ----------

export interface Preset {
  emoji: string;
  label: string;
  desc: string;
  setup: PersonaSetup;
}

export const HR_MODE_PRESETS: Preset[] = [
  {
    emoji: '🚀',
    label: '手握竞对Offer的前端专家',
    desc: '林晓 · 5年前端 · 手里还有一份竞对Offer',
    setup: {
      mode: 'hr',
      difficulty: 'tough',
      npcName: '林晓',
      npcVariant: 'candidateF',
      npcTitle: '候选人 · 高级前端工程师',
      candidateCurrent: '28k×16薪，年薪约45万',
      candidateExpect: '38k×16薪，另希望有签字费',
      resume:
        '某二线大厂5年前端，主导过千万级DAU活动页性能优化（LCP从3.2s降到1.4s），带过3人小组，熟悉React/微前端，社区有万字技术文章，Github 2k star。',
      interviewNotes:
        '技术面评价A（系统设计稍弱但工程能力强），沟通清晰有主见，离职原因：晋升停滞。已通过全部面试，用人部门强烈想要。',
      hrBudget: '公司对该岗位批了 30k~35k×16薪，特殊申请可到 36k，签字费最多2万',
    },
  },
  {
    emoji: '🎓',
    label: '应届算法博士',
    desc: '陈默 · 应届博士 · 论文耀眼但没谈过薪',
    setup: {
      mode: 'hr',
      difficulty: 'friendly',
      npcName: '陈默',
      npcVariant: 'candidateM',
      npcTitle: '候选人 · 算法工程师(应届)',
      candidateCurrent: '在读博士，实习补贴 8k/月',
      candidateExpect: '听说大厂算法岗很高，期望 45k×15薪',
      resume:
        '985本硕博，一作顶会2篇(CVPR/NeurIPS)，研究生方向多模态，大厂实习6个月转正意向，无其他offer在手但对薪资行情了解不多。',
      interviewNotes: '技术面A+，基础扎实，性格偏内向真诚，被问期望薪资时会紧张。用人部门反馈：潜力股。',
      hrBudget: '应届算法岗标准包 32k~38k×15薪， SuperSpecial 可到 42k',
    },
  },
  {
    emoji: '💼',
    label: '外企回流的高级产品',
    desc: '王雨桐 · 8年产品 · 从外企回流看机会',
    setup: {
      mode: 'hr',
      difficulty: 'standard',
      npcName: '王雨桐',
      npcVariant: 'candidateF',
      npcTitle: '候选人 · 高级产品经理',
      candidateCurrent: '45k×13薪（外企），另有津贴',
      candidateExpect: '平薪或微涨，52k左右，看重稳定和WLB',
      resume:
        '8年B端产品，外企SaaS中国区核心产品线负责人，从0到1做过两条产品线，跨部门推动能力强，英语流利。',
      interviewNotes:
        '产品面评价A，商业sense好，但对国内互联网节奏有顾虑，反复追问加班情况。稳定性是她最看重的点。',
      hrBudget: '岗位预算 42k~50k×16薪，年薪总包可到 80万',
    },
  },
  {
    emoji: '😤',
    label: '被裁后要价上浮的架构师',
    desc: '赵磊 · 10年后端 · 上家被裁补偿谈崩心态',
    setup: {
      mode: 'hr',
      difficulty: 'tough',
      npcName: '赵磊',
      npcVariant: 'candidateM',
      npcTitle: '候选人 · 后端架构师',
      candidateCurrent: '50k×16薪（上家被优化）',
      candidateExpect: '60k×16薪起，"我这行情只高不低"',
      resume:
        '10年后端，支付与高并发领域专家，主导过年百亿级交易系统重构，面试表现强势，频频反问面试官技术细节。',
      interviewNotes:
        '技术面A-（能力没得说，但团队反馈其姿态较高），情绪点：上家公司裁员处理方式让他很不爽，谈钱时格外敏感。',
      hrBudget: '架构岗批了 52k~58k×15薪，最多上浮到 60k×15 但需要额外审批理由',
    },
  },
];

export const CANDIDATE_MODE_PRESETS: Preset[] = [
  {
    emoji: '🏢',
    label: '大厂HRBP的标准压价',
    desc: '方琳 · 大厂HRBP · 专业礼貌但预算卡得死',
    setup: {
      mode: 'candidate',
      difficulty: 'standard',
      npcName: '方琳',
      npcVariant: 'hrF',
      npcTitle: 'HRBP · 某互联网大厂',
      companyInfo: '头部互联网大厂，电商事业群，团队负责交易中台',
      jobInfo: '高级后端工程师 P6/P7，base 杭州，业务核心链路，有股票包',
      hrBudgetRange: '月薪 35k~42k×16薪，股票看级别 20万~50万/4年，签字费仅特殊case',
      companySelling: '平台大、业务核心、股票增值空间、晋升通道清晰',
      playerResume: '6年后端，二线厂，当前 30k×14薪，面试评价A，用人部门急招',
    },
  },
  {
    emoji: '🦄',
    label: '创业公司CEO的画饼攻势',
    desc: '郑楠 · 创业公司合伙人 · 期权管够现金收紧',
    setup: {
      mode: 'candidate',
      difficulty: 'tough',
      npcName: '郑楠',
      npcVariant: 'hrM',
      npcTitle: '联合创始人 · AI创业公司',
      companyInfo: 'B轮AI创业公司，50人，明星投资人，产品海外营收增长快',
      jobInfo: '全栈工程师/技术合伙人候选，直接向CTO汇报，话语权大',
      hrBudgetRange: '现金 25k~30k×13薪（明显低于市场），期权 0.5%~1%，画大饼空间充足',
      companySelling: '期权暴富故事、成长速度、扁平管理、远程灵活',
      playerResume: '5年全栈，当前 32k×14薪大厂，期望 38k+',
    },
  },
  {
    emoji: '🏭',
    label: '传统企业转型HR的预算困局',
    desc: '周敏 · 制造业集团HR · 预算紧但想要人',
    setup: {
      mode: 'candidate',
      difficulty: 'tough',
      npcName: '周敏',
      npcVariant: 'hrF',
      npcTitle: '人力资源总监 · 制造业集团',
      companyInfo: '上市制造业集团数字化转型专项，国企风格但待遇稳定',
      jobInfo: '数字化中心 · 高级数据工程师，base 苏州，13薪+年终绩效',
      hrBudgetRange: '月薪 22k~26k×13薪，年终 2~4个月，福利房补餐补齐全但现金有限',
      companySelling: '稳定不裁员、WLB、隐藏福利（企业年金、补充医疗）、职级体面',
      playerResume: '4年数据开发，当前 24k×14薪，期望 30k，对稳定性有一定好感',
    },
  },
  {
    emoji: '🤝',
    label: '外企HR的WLB谈判',
    desc: 'Daniel · 外企HR · 现金不高但够真诚',
    setup: {
      mode: 'candidate',
      difficulty: 'friendly',
      npcName: 'Daniel',
      npcVariant: 'hrM',
      npcTitle: 'HR Manager · 外企中国区',
      companyInfo: '百年外企中国区，SaaS业务，无加班文化',
      jobInfo: 'Senior Engineer，base 上海，居家办公2天/周，15薪+津贴',
      hrBudgetRange: '月薪 30k~36k×13薪 + 年度奖金目标10%，签字费可谈1个月',
      companySelling: 'WLB、弹性办公、20天年假、外企职级 title、培训预算',
      playerResume: '7年开发，当前 34k×14薪大厂高强度，期望 38k，家庭原因想换节奏',
    },
  },
];

// ---------- 提示词 ----------

const META_RULE = `【元数据协议——每一条回复都必须严格遵守，历史里你的每句台词都以它结尾】
你的每条回复由两部分组成：
1. 角色台词：2~4句口语，总共不超过80个字。像真人一样说话，可以有语气词、反问、停顿。禁止markdown、禁止列表、禁止旁白解释、禁止书面腔。
2. 台词之后必须另起一行，输出元数据（游戏系统读取，玩家看不到），格式严格如下：
[[情绪:关键词|温度:±N|动作:一句动作神态描写]]
示例：
你这个数我很难接受啊，我手上还有一份竞对offer呢。
[[情绪:不满|温度:-12|动作:微微皱眉，手指轻敲桌面]]
- 情绪关键词只能从这些里选：平静,心动,满意,开心,惊喜,自信,从容,坚定,犹豫,纠结,迟疑,沉思,不满,失望,生气,愤怒,惊讶,无奈,委屈
- 温度是 -30 到 +30 的整数（可省略正号），表示这轮对话后你对达成协议的信心变化。
- 动作用一句白描，如"指尖轻敲桌面"。
当且仅当谈判出现明确结果时，在元数据之后再加一行：
[[结局:成交|条件:一句话写清最终达成的条件]] 或 [[结局:破裂]]
成交必须是你扮演的角色真心能接受的条件，不要无原则投降。
再次强调：没有元数据行的回复视为格式错误，必须带上。`;

const COMMON_RULE = `你正在参演一款沉浸式"谈薪谈判"角色扮演游戏（视觉小说形式）。你只扮演分配给你的角色，用第一人称中文口语说话。

你必须演得像真人：
- 有真实的心理底线、利益诉求和情绪，会试探、会砍价、会被打动、也会被冒犯。
- 对方提出具体数字时，你会算账（时薪、总包、期权价值），会追问细节：调薪机制、加班强度、期权行权、签字费、年终奖、职级。
- 不要轻易让步，也不要无理取闹。对方给出足够诚意时可以松动，但可以换个维度要补偿（签字费、期权、远程、title）。
- 绝不承认自己是AI或游戏角色，绝不输出剧本式说明，绝不出戏。`;

function difficultyLine(d: Difficulty, role: 'candidate' | 'hr'): string {
  if (role === 'candidate') {
    switch (d) {
      case 'friendly':
        return '你的谈判风格【温和】：坦诚好沟通，愿意相信对方，只要条件过得去、态度真诚就愿意松口，底线比期望低约15%。';
      case 'tough':
        return '你的谈判风格【强硬】：精明强势、寸土必争，善用杠杆（竞对offer、行情数据、沉默施压），底线几乎贴着期望值，还想要额外补偿。';
      default:
        return '你的谈判风格【标准】：有来有回讲道理，会被真诚打动也会守住核心利益，底线比期望低约8%。';
    }
  }
  switch (d) {
    case 'friendly':
      return '你的谈判风格【温和】：亲切真诚，会主动帮候选人争取，尽量给到预算上限，但预算红线仍然存在。';
    case 'tough':
      return '你的谈判风格【强硬】：老练的压价高手，会质疑薪资流水、用市场行情压预期、用期权和情怀画饼、用审批流程当挡箭牌。';
    default:
        return '你的谈判风格【标准】：专业公正，在公司利益和候选人体验之间平衡，预算内灵活、预算外需要理由。';
  }
}

export function buildNpcSystemPrompt(p: PersonaSetup): string {
  if (p.mode === 'hr') {
    return `${COMMON_RULE}

【你的角色】候选人「${p.npcName}」——${p.npcTitle}
- 简历要点：${p.resume || '（未提供，请合理自行脑补普通背景）'}
- 面试记录与评价：${p.interviewNotes || '（未提供）'}
- 当前薪资：${p.candidateCurrent || '未知'}
- 你的期望：${p.candidateExpect || '希望有明显涨幅'}
${difficultyLine(p.difficulty, 'candidate')}

【导演机密（你不知道这个信息，但要参考它让自己的要价落在戏剧合理区间，严禁直接说破数字来源）】
对方（HR）的预算空间：${p.hrBudget || '未知'}

【开场】对方是HR，请你先自然开场：简短感谢对方安排，然后主动把话题引向薪资。之后的每一轮都针对对方的最新发言回应。称呼对方为"您"，不要给对方虚构姓名。

${META_RULE}`;
  }
  return `${COMMON_RULE}

【你的角色】HR「${p.npcName}」——${p.npcTitle}
- 公司情况：${p.companyInfo || '（未提供，请合理脑补一家中型公司）'}
- 岗位信息：${p.jobInfo || '（未提供）'}
- 公司可讲的卖点：${p.companySelling || '（未提供）'}
- 你已掌握的候选人资料：${p.playerResume || '（只知道面试表现不错）'}
${difficultyLine(p.difficulty, 'hr')}

【导演机密（你不知道这个信息，但要参考它让自己的报价落在戏剧合理区间，严禁直接说破数字来源）】
你的真实预算区间：${p.hrBudgetRange || '未知'}

【开场】这是你发起的薪资沟通电话/约谈。请你先开场：礼貌寒暄后进入正题，可以主动报一个初步范围试探对方反应。之后的每一轮都针对对方的最新发言回应。称呼对方为"您"或"同学"，不要给对方虚构姓名。

${META_RULE}`;
}

export function buildCoachSystemPrompt(p: PersonaSetup): string {
  const role =
    p.mode === 'hr'
      ? `玩家扮演HR，AI扮演候选人「${p.npcName}」。候选人设定：当前 ${p.candidateCurrent || '未知'}，期望 ${p.candidateExpect || '未知'}。【导演机密】HR预算：${p.hrBudget || '未知'}，候选人面试评价：${p.interviewNotes || '未提供'}`
      : `玩家扮演候选人，AI扮演HR「${p.npcName}」。公司岗位：${p.jobInfo || '未知'}。【导演机密】公司预算：${p.hrBudgetRange || '未知'}，玩家自身情况：${p.playerResume || '未知'}`;

  return `你是一位资深的人力资源顾问与谈判复盘教练，精通薪酬谈判心理学。现在请根据一场谈薪模拟游戏的完整对话记录，输出专业复盘报告。

${role}

要求：
- 全部用中文，语气专业但有温度，直接可用 markdown 小节标题（## 开头）。
- 引用玩家原话作为证据时用引号标注。
- 总长度 600~1000 字。
- 先做结局判定（结合对话走向与玩家的收场声明综合判断：成交/破裂/僵局未定），再按对应结构展开。
- 若判定为成交或基本达成：重点分析"玩家最在意的点"——从玩家的措辞、追问、坚持和让步中推断其真实优先级，给出 TOP3 并附原话证据；再给玩家谈判风格画像、关键转折回合复盘、下一次的建议。
- 若判定为破裂或失败：按时间线指出玩家的哪几句话把谈判推向破裂（引用原话），还原对方的心理与真实底线，指出本可以挽回的时机，给出具体话术建议。
- 若判定为僵局：两边都分析，并给出破局思路。
- 最后加一节"## 🎓 一句话带走"作为总结金句。`;
}

export function buildAnalysisUserMessage(
  p: PersonaSetup,
  rounds: Round[],
  declared: 'deal' | 'break'
): string {
  const declaredText =
    declared === 'deal' ? '玩家在结束时声明：双方达成一致。' : '玩家在结束时声明：谈判破裂，没有谈成。';
  const transcript = rounds
    .filter((r) => !r.hidden && r.role !== 'system')
    .map((r) => `${r.role === 'player' ? '玩家' : p.npcName}：${r.text}${r.meta?.action ? `（${r.meta.action}）` : ''}`)
    .join('\n');
  return `【完整谈判记录】
${transcript || '（没有对话内容）'}

【收场声明】${declaredText}

请输出复盘报告。`;
}

// ---------- 标记解析 ----------

const MARKER_RE = /\[\[([^\]]*)\]\]/g;

export function parseMeta(raw: string): NpcMeta {
  const meta: NpcMeta = {};
  for (const m of Array.from(raw.matchAll(MARKER_RE))) {
    const body = m[1];
    for (const part of body.split('|')) {
      const idx = part.indexOf(':');
      if (idx < 0) continue;
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      if (key === '情绪') meta.emotion = val;
      else if (key === '温度') {
        const n = parseInt(val.replace('+', ''), 10);
        if (!Number.isNaN(n)) meta.tempDelta = n;
      } else if (key === '动作') meta.action = val;
      else if (key === '结局') {
        meta.end = val.includes('成交') ? 'deal' : 'break';
        if (meta.end === 'deal') meta.endCondition = '';
      } else if (key === '条件') meta.endCondition = val;
    }
  }
  return meta;
}

/** 流式安全：剥离已完结的标记；若存在未闭合的 [[ 则截断到其之前 */
export function stripMarkersStreaming(text: string): string {
  let out = text.replace(MARKER_RE, '');
  const idx = out.indexOf('[[');
  if (idx >= 0) out = out.slice(0, idx);
  return out.trim();
}

export function stripMarkersFinal(raw: string): string {
  return raw.replace(MARKER_RE, '').trim();
}

const EMOTION_MAP: [RegExp, Expression][] = [
  [/心动|满意|开心|高兴|惊喜|欣然|兴奋|愉悦|欣赏|感激/, 'happy'],
  [/不满|生气|愤怒|恼|失望|不悦|烦躁|冒犯|拒绝|冷笑/, 'angry'],
  [/犹豫|纠结|思考|沉吟|权衡|迟疑|疑虑|犹豫不决|观望/, 'thinking'],
  [/惊讶|吃惊|震惊|意外|错愕/, 'surprised'],
  [/无奈|委屈|失落|沮丧|低落|叹|伤感|心寒/, 'sad'],
  [/自信|从容|淡定|胸有成竹|强势|坚定|专注/, 'smug'],
];

export function emotionToExpression(emotion?: string): Expression {
  if (!emotion) return 'neutral';
  for (const [re, exp] of EMOTION_MAP) if (re.test(emotion)) return exp;
  return 'neutral';
}

export const EXPRESSION_BADGE: Record<Expression, { emoji: string; label: string }> = {
  neutral: { emoji: '🙂', label: '平静' },
  happy: { emoji: '💗', label: '心动' },
  angry: { emoji: '💢', label: '不满' },
  thinking: { emoji: '🤔', label: '犹豫' },
  surprised: { emoji: '😲', label: '惊讶' },
  sad: { emoji: '😔', label: '低落' },
  smug: { emoji: '😎', label: '自信' },
};

export function tempLabel(temp: number): { text: string; color: string } {
  if (temp < 20) return { text: '谈崩边缘', color: 'text-red-400' };
  if (temp < 40) return { text: '气氛冰冷', color: 'text-orange-400' };
  if (temp < 60) return { text: '拉锯之中', color: 'text-yellow-300' };
  if (temp < 80) return { text: '渐入佳境', color: 'text-lime-300' };
  return { text: '一拍即合', color: 'text-emerald-400' };
}
