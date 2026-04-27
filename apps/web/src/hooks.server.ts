import { isAuthed } from '$lib/server/session';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const PUBLIC_PATHS = new Set(['/login']);

const isPublic = (pathname: string): boolean =>
  PUBLIC_PATHS.has(pathname) || pathname === '/mcp' || pathname.startsWith('/mcp/');

export const handle: Handle = ({ event, resolve }) => {
  event.locals.authed = isAuthed(event.cookies);

  if (!event.locals.authed && !isPublic(event.url.pathname)) {
    throw redirect(303, `/login?next=${encodeURIComponent(event.url.pathname)}`);
  }

  return resolve(event);
};
