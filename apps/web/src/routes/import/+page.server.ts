import { findListByPrefix, importCsv, listLists } from '@budden/core';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ lists: listLists(db()) });

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const listInput = String(data.get('list_id') ?? '').trim();
    const csvText = String(data.get('csv') ?? '').trim();

    if (!listInput) return fail(400, { error: 'pick a list' });
    if (!csvText) return fail(400, { error: 'paste some CSV' });

    const list = findListByPrefix(db(), listInput);
    if (!list) return fail(400, { error: `no list matching ${listInput}` });

    const result = importCsv(db(), csvText, { listId: list.id });
    throw redirect(
      303,
      `/lists/${list.id}?imported=${result.created}&linked=${result.linked}&dupes=${result.duplicates}`,
    );
  },
};
