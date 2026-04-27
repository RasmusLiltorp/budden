import { expectedToken, setSession } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
  if (locals.authed) throw redirect(303, url.searchParams.get('next') || '/');
  return { configured: expectedToken() !== null };
};

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const data = await request.formData();
    const token = String(data.get('token') ?? '').trim();
    const expected = expectedToken();

    if (!expected) return fail(400, { error: 'No token configured. Run `budden init` first.' });
    if (token !== expected) return fail(401, { error: 'Invalid token.' });

    setSession(cookies, token, url);
    throw redirect(303, url.searchParams.get('next') || '/');
  },
};
