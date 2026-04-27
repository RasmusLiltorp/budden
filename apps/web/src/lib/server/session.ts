import { loadConfig } from '@budden/config';
import type { Cookies } from '@sveltejs/kit';

const COOKIE = 'budden_token';

export const expectedToken = (): string | null => loadConfig().server.token;

export const isAuthed = (cookies: Cookies): boolean => {
  const expected = expectedToken();
  if (!expected) return false;
  return cookies.get(COOKIE) === expected;
};

export const setSession = (cookies: Cookies, token: string, url: URL): void => {
  cookies.set(COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: url.protocol === 'https:',
    maxAge: 60 * 60 * 24 * 30,
  });
};

export const clearSession = (cookies: Cookies): void => {
  cookies.delete(COOKIE, { path: '/' });
};
