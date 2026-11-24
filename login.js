import { COOKIE, sessionToken, json } from './_auth.js';

export async function POST(request) {
  if (!process.env.TEAM_PASSWORD) {
    return json({ error: 'The team password hasn’t been set up yet. Add TEAM_PASSWORD in Vercel.' }, 500);
  }
  let body = {};
  try { body = await request.json(); } catch (e) {}
  const given = String(body.password || '');
  // small delay makes guessing slower
  await new Promise((r) => setTimeout(r, 400));
  if (given !== process.env.TEAM_PASSWORD) return json({ error: 'That password isn’t right.' }, 401);
  const token = await sessionToken();
  const cookie = `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
  return json({ ok: true }, 200, { 'set-cookie': cookie });
}
