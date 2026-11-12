import { put, list, del, get } from '@vercel/blob';
import { isSignedIn, json } from './_auth.js';

const TOOL_KEY = /^[a-z0-9-]{3,40}$/;
// Blob stores can be private or public. Try the configured one first, then the other.
let ACCESS = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';
const other = (a) => (a === 'private' ? 'public' : 'private');
const path = (tool, id) => `presets/${tool}/${id}.json`;

function check(request) {
  const tool = new URL(request.url).searchParams.get('tool');
  if (!TOOL_KEY.test(tool || '')) return { error: json({ error: 'Unknown tool.' }, 400) };
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: json({ error: 'Team storage isn’t connected yet. Connect a Blob store in Vercel.' }, 503) };
  }
  return { tool };
}

async function readOne(pathname) {
  for (const access of [ACCESS, other(ACCESS)]) {
    try {
      const res = await get(pathname, { access, useCache: false });
      if (!res) return null;
      const text = await new Response(res.stream).text();
      ACCESS = access;
      return JSON.parse(text);
    } catch (e) { /* try the other access type */ }
  }
  return null;
}

export async function GET(request) {
  if (!(await isSignedIn(request))) return json({ error: 'Please sign in again.' }, 401);
  const c = check(request); if (c.error) return c.error;
  const found = [];
  let cursor;
  do {
    const page = await list({ prefix: `presets/${c.tool}/`, cursor, limit: 1000 });
    found.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  const presets = (await Promise.all(found.map((b) => readOne(b.pathname)))).filter(Boolean);
  presets.sort((a, b) => (a.at || 0) - (b.at || 0));
  return json({ presets });
}

export async function POST(request) {
  if (!(await isSignedIn(request))) return json({ error: 'Please sign in again.' }, 401);
  const c = check(request); if (c.error) return c.error;
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'That preset couldn’t be read.' }, 400); }
  const preset = body && body.preset;
  if (!preset || typeof preset !== 'object' || !preset.P) return json({ error: 'That preset is empty.' }, 400);
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  preset.id = id;
  preset.tool = c.tool;
  preset.name = String(preset.name || 'Preset').slice(0, 60);
  preset.by = String(preset.by || '').slice(0, 40);
  preset.at = Date.now();
  const text = JSON.stringify(preset);
  if (text.length > 4_000_000) return json({ error: 'That preset is too large to share. Try a smaller image.' }, 413);
  let lastError;
  for (const access of [ACCESS, other(ACCESS)]) {
    try {
      await put(path(c.tool, id), text, { access, contentType: 'application/json', addRandomSuffix: false });
      ACCESS = access;
      return json({ preset });
    } catch (e) { lastError = e; }
  }
  console.error(lastError);
  return json({ error: 'Couldn’t save to team storage. Try again in a moment.' }, 500);
}

export async function DELETE(request) {
  if (!(await isSignedIn(request))) return json({ error: 'Please sign in again.' }, 401);
  const c = check(request); if (c.error) return c.error;
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[a-z0-9]{4,40}$/.test(id)) return json({ error: 'Unknown preset.' }, 400);
  try { await del(path(c.tool, id)); } catch (e) { return json({ error: 'Couldn’t delete that preset.' }, 500); }
  return json({ ok: true });
}
