import { db } from '$lib/server/db';
import { createList, listLists, membershipsForList } from '@budden/core';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  const d = db();
  const lists = listLists(d, { includeArchived: true });
  const rows = lists.map((list) => ({
    list,
    contactCount: membershipsForList(d, list.id).length,
  }));
  return { rows };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const name = String(data.get('name') ?? '').trim();
    if (!name) return fail(400, { error: 'name is required' });
    const list = createList(db(), {
      name,
      description: String(data.get('description') ?? '').trim() || null,
      goal: String(data.get('goal') ?? '').trim() || null,
    });
    throw redirect(303, `/lists/${list.id}`);
  },
};
