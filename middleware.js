import { next } from '@vercel/functions';
import { isSignedIn } from './api/_auth.js';

// Everything is behind the team password, except the login page and what it needs.
const OPEN = ['/login', '/login.html', '/api/login', '/favicon.svg'];

export default async function middleware(request) {
  const url = new URL(request.url);
  const p = url.pathname;
  if (OPEN.includes(p) || p.startsWith('/assets/')) return next();
  if (await isSignedIn(request)) return next();
  if (p.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'Please sign in again.' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }
  const to = new URL('/login', request.url);
  if (p !== '/' && p !== '/index' && p !== '/index.html') to.searchParams.set('next', p + url.search);
  return Response.redirect(to, 302);
}
