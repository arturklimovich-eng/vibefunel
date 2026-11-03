import fs from 'node:fs';
import path from 'node:path';
import { Resolver } from 'node:dns/promises';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEW_HOST = process.env.NEW_HOST ?? 'rd-leads.uk';
const OLD_HOST = process.env.OLD_HOST ?? 'vibefunel.myftp.org';
const SERVER_IP = '2.28.75.224';
const COOLIFY_URL = new URL(process.env.COOLIFY_URL ?? 'https://coolify.rd-leads.uk');
if (COOLIFY_URL.protocol !== 'https:') throw new Error('COOLIFY_URL must use https');
const COOLIFY = new URL('/api/v1', COOLIFY_URL).href;
const APP_UUID = 'ghofuaurl8pytwtc5vcdohjn';
const SUPABASE_REF = 'xkutkgleogwrfolbggvc';
const APPLY = process.argv.includes('--apply');
const WAIT = process.argv.includes('--wait');

function readEnv(file) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  return (key) =>
    new RegExp(`^${key}=(.*)$`, 'm')
      .exec(text)?.[1]
      ?.trim()
      .replace(/^["']|["']$/g, '');
}

const local = readEnv('apps/web/.env');
const coolifyToken = local('COOLIFY_API_TOKEN');
const supabaseToken = local('SUPABASE_ACCESS_TOKEN');
if (!coolifyToken || !supabaseToken)
  throw new Error('COOLIFY_API_TOKEN or SUPABASE_ACCESS_TOKEN missing');

const coolifyHeaders = {
  authorization: `Bearer ${coolifyToken}`,
  accept: 'application/json',
  'content-type': 'application/json',
};
const supabaseHeaders = {
  authorization: `Bearer ${supabaseToken}`,
  'content-type': 'application/json',
};

async function call(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok)
    throw new Error(`${init?.method ?? 'GET'} ${url} -> ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

async function dnsReady() {
  const resolver = new Resolver();
  resolver.setServers(['1.1.1.1', '8.8.8.8']);
  const out = {};
  for (const host of [NEW_HOST, `www.${NEW_HOST}`]) {
    try {
      out[host] = await resolver.resolve4(host);
    } catch {
      out[host] = [];
    }
  }
  const ok = Object.values(out).every((ips) => ips.length === 1 && ips[0] === SERVER_IP);
  return { ok, out };
}

async function plan() {
  const app = await call(`${COOLIFY}/applications/${APP_UUID}`, { headers: coolifyHeaders });
  const auth = await call(`https://api.supabase.com/v1/projects/${SUPABASE_REF}/config/auth`, {
    headers: supabaseHeaders,
  });
  const domains = [`https://${NEW_HOST}`, `https://www.${NEW_HOST}`, `https://${OLD_HOST}`].join(
    ',',
  );
  const allow = new Set((auth.uri_allow_list ?? '').split(',').filter(Boolean));
  allow.add(`https://${NEW_HOST}/login`);
  allow.add(`https://${NEW_HOST}/**`);
  const envs = {
    APP_URL: `https://${NEW_HOST}`,
    CUSTOM_DOMAIN_TARGET: NEW_HOST,
    PLATFORM_HOSTS: `www.${NEW_HOST},${OLD_HOST}`,
  };
  return {
    coolify: {
      from: { fqdn: app.fqdn, redirect: app.redirect },
      to: { domains, redirect: 'non-www' },
    },
    supabase: {
      from: { site_url: auth.site_url, uri_allow_list: auth.uri_allow_list },
      to: { site_url: `https://${NEW_HOST}`, uri_allow_list: [...allow].join(',') },
    },
    envs,
  };
}

function updateEnvFile(envs) {
  const file = path.join(ROOT, '.env.coolify');
  let text = fs.readFileSync(file, 'utf8');
  for (const [key, value] of Object.entries(envs)) {
    const line = `${key}=${value}`;
    text = new RegExp(`^${key}=.*$`, 'm').test(text)
      ? text.replace(new RegExp(`^${key}=.*$`, 'm'), () => line)
      : `${text.replace(/\s*$/, '')}\n${line}\n`;
  }
  fs.writeFileSync(file, text);
}

async function waitDeploy(uuid) {
  for (let i = 0; i < 60; i += 1) {
    const d = await call(`${COOLIFY}/deployments/${uuid}`, { headers: coolifyHeaders });
    if (d.status === 'finished') return;
    if (d.status === 'failed' || String(d.status).startsWith('cancelled')) {
      throw new Error(`deployment ${uuid} ${d.status}`);
    }
    await new Promise((r) => setTimeout(r, 15000));
  }
  throw new Error('deployment timed out');
}

async function verify() {
  const checks = [
    [`https://${NEW_HOST}/api/health`, 200],
    [`https://${OLD_HOST}/api/health`, 200],
  ];
  for (const [url, want] of checks) {
    let status = 0;
    for (let i = 0; i < 20 && status !== want; i += 1) {
      try {
        status = (await fetch(url, { redirect: 'manual' })).status;
      } catch {
        status = 0;
      }
      if (status !== want) await new Promise((r) => setTimeout(r, 15000));
    }
    console.log(`${url} -> ${status}${status === want ? '' : ` (expected ${want})`}`);
  }
  try {
    const res = await fetch(`https://www.${NEW_HOST}/`, { redirect: 'manual' });
    console.log(`https://www.${NEW_HOST}/ -> ${res.status} ${res.headers.get('location') ?? ''}`);
  } catch (error) {
    console.log(`https://www.${NEW_HOST}/ -> ${error.message}`);
  }
}

let dns = await dnsReady();
while (WAIT && !dns.ok) {
  console.log(`waiting for DNS: ${JSON.stringify(dns.out)}`);
  await new Promise((r) => setTimeout(r, 60000));
  dns = await dnsReady();
}
console.log(`DNS ${dns.ok ? 'ready' : 'NOT ready'}: ${JSON.stringify(dns.out)}`);
const p = await plan();
console.log(JSON.stringify(p, null, 2));

async function apply() {
  updateEnvFile(p.envs);
  await call(`${COOLIFY}/applications/${APP_UUID}/envs/bulk`, {
    method: 'PATCH',
    headers: coolifyHeaders,
    body: JSON.stringify({ data: Object.entries(p.envs).map(([key, value]) => ({ key, value })) }),
  });
  console.log('Coolify env updated, .env.coolify updated');
  await call(`${COOLIFY}/applications/${APP_UUID}`, {
    method: 'PATCH',
    headers: coolifyHeaders,
    body: JSON.stringify(p.coolify.to),
  });
  console.log('Coolify domains updated');
  await call(`https://api.supabase.com/v1/projects/${SUPABASE_REF}/config/auth`, {
    method: 'PATCH',
    headers: supabaseHeaders,
    body: JSON.stringify(p.supabase.to),
  });
  console.log('Supabase auth URLs updated');
  const deploy = await call(`${COOLIFY}/deploy`, {
    method: 'POST',
    headers: coolifyHeaders,
    body: JSON.stringify({ uuid: APP_UUID }),
  });
  const id = deploy.deployments?.[0]?.deployment_uuid;
  console.log(`Deploy queued ${id}`);
  if (id) await waitDeploy(id);
  await verify();
}

if (!APPLY) {
  console.log('Dry run. Re-run with --apply (and optionally --wait) to switch.');
} else if (!dns.ok) {
  console.log('Refusing to apply: DNS does not point at the server yet.');
  process.exitCode = 1;
} else {
  await apply();
}
