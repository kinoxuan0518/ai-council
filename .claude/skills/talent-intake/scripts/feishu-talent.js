#!/usr/bin/env node
/**
 * 飞书招聘人才库操作脚本（零依赖，仅需 Node.js 18+）
 * 用法：
 *   node feishu-talent.js lookup <手机号>              → 按手机号查talent_id
 *   node feishu-talent.js get <talent_id>              → 获取人才详情
 *   node feishu-talent.js note <talent_id> <privacy>   → 从 stdin 读取内容创建备注
 *
 * 凭证：环境变量 FEISHU_APP_ID / FEISHU_APP_SECRET
 * 需要权限：hire:talent:readonly、hire:note
 */

const BASE = 'https://open.feishu.cn/open-apis';

// ── 认证 ──────────────────────────────────────────────
let cachedToken = null;
let tokenExpiry = 0;

async function getToken(appId, appSecret) {
  if (cachedToken && Date.now() < tokenExpiry - 60000) return cachedToken;
  const res = await fetch(`${BASE}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`获取token失败: ${data.msg} (code=${data.code})`);
  cachedToken = data.tenant_access_token;
  tokenExpiry = Date.now() + data.expire * 1000;
  return cachedToken;
}

function getCreds() {
  const appId = process.env.FEISHU_APP_ID || 'cli_a95db40d26f81bd8';
  const appSecret = process.env.FEISHU_APP_SECRET || '7nx4ANMQysgnEQNLDkdItcKXZ0BFBkTI';
  return { appId, appSecret };
}

async function feishuReq(method, path, body) {
  const { appId, appSecret } = getCreds();
  const token = await getToken(appId, appSecret);
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  return res.json();
}

// ── 命令 ──────────────────────────────────────────────

async function lookup(phone) {
  const data = await feishuReq('POST', '/hire/v1/talents/batch_get_id', {
    mobile_code: '86',
    mobile_number_list: [phone],
  });
  if (data.code !== 0) {
    console.error(JSON.stringify({ error: true, code: data.code, msg: data.msg }));
    process.exit(1);
  }
  const list = data.data?.talent_list || [];
  if (list.length === 0) {
    console.log(JSON.stringify({ found: false, phone }));
    return;
  }
  const t = list[0];
  console.log(JSON.stringify({
    found: true,
    talent_id: t.talent_id,
    mobile: t.mobile_number,
    mobile_code: t.mobile_code,
  }));
}

async function getTalent(talentId) {
  // v1 API 返回完整 career_list，v2 只有 customized_data_list
  const data = await feishuReq('GET', `/hire/v1/talents/${talentId}`);
  if (data.code !== 0) {
    console.error(JSON.stringify({ error: true, code: data.code, msg: data.msg }));
    process.exit(1);
  }
  const t = data.data?.talent;
  console.log(JSON.stringify({
    talent_id: talentId,
    name: t?.basic_info?.name || '',
    mobile: t?.basic_info?.mobile || '',
    mobile_code: t?.basic_info?.mobile_code || '',
    email: t?.basic_info?.email || '',
    gender: t?.basic_info?.gender === 1 ? '男' : t?.basic_info?.gender === 2 ? '女' : '',
    experience_years: t?.basic_info?.experience_years || 0,
    current_city: t?.basic_info?.current_city?.zh_name || '',
    education: (t?.education_list || []).map(e => ({
      school: e.school || '',
      degree: e.degree,
      field: e.field_of_study || '',
      start: e.start_time || '',
      end: e.end_time || '',
    })),
    career: (t?.career_list || []).map(c => ({
      company: c.company || '',
      title: c.title || '',
      start: c.start_time || '',
      end: c.end_time || '',
      desc: (c.desc || '').slice(0, 500),
    })),
  }, null, 2));
}

async function createNote(talentId, privacy) {
  // 从 stdin 读取备注内容，避免命令行参数长度限制
  const chunks = [];
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) chunks.push(chunk);
  const content = chunks.join('').trim();

  const priv = parseInt(privacy) === 2 ? 2 : 1;
  const data = await feishuReq('POST', '/hire/v1/notes', {
    talent_id: talentId,
    content,
    privacy: priv,
  });
  if (data.code !== 0) {
    console.error(JSON.stringify({
      error: true,
      code: data.code,
      msg: data.msg,
      hint: data.code === 99991672 ? `缺少权限。请在飞书开放平台开通 hire:note 权限。` : undefined,
    }));
    process.exit(1);
  }
  console.log(JSON.stringify({
    success: true,
    note_id: data.data?.note?.id,
    talent_id: talentId,
    privacy: priv === 2 ? '公开' : '私密',
  }));
}

// ── 入口 ──────────────────────────────────────────────

async function main() {
  const cmd = process.argv[2];
  switch (cmd) {
    case 'lookup':
      await lookup(process.argv[3]);
      break;
    case 'get':
      await getTalent(process.argv[3]);
      break;
    case 'note':
      await createNote(process.argv[3], process.argv[4]);
      break;
    default:
      console.error('用法: feishu-talent.js lookup <手机号> | get <talent_id> | note <talent_id> <1|2> < 内容文件');
      console.error('  note 命令从 stdin 读取备注内容: echo "内容" | node feishu-talent.js note <id> 2');
      process.exit(1);
  }
}

main();
