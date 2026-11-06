// Shared helpers for the team password.
export const COOKIE = 'tba_session';

export async function sessionToken() {
  const pw = process.env.TEAM_PASSWORD || '';
  const data = new TextEncoder().encode(pw + '::tools-by-athul');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export async function isSignedIn(request) {
  if (!process.env.TEAM_PASSWORD) return false;
  return readCookie(request, COOKIE) === (await sessionToken());
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
  });
}
