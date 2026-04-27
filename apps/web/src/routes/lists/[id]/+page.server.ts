import { db } from '$lib/server/db';
import {
  archiveList,
  assignToList,
  createContact,
  findListByPrefix,
  findOrCreateCompany,
  membershipsWithContactsForList,
} from '@budden/core';
import { type MembershipStatus, Priority } from '@budden/shared';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const EMPTY_COUNTS: Record<MembershipStatus, number> = {
  not_contacted: 0,
  contacted: 0,
  replied: 0,
  in_conversation: 0,
  booked: 0,
  closed_won: 0,
  closed_lost: 0,
  do_not_contact: 0,
};

export const load: PageServerLoad = ({ params }) => {
  const d = db();
  const list = findListByPrefix(d, params.id);
  if (!list) throw error(404, 'list not found');

  const rows = membershipsWithContactsForList(d, list.id);
  const counts = { ...EMPTY_COUNTS };
  for (const r of rows) counts[r.membership.status]++;

  return { list, rows, counts };
};

export const actions: Actions = {
  addContact: async ({ params, request }) => {
    const d = db();
    const list = findListByPrefix(d, params.id);
    if (!list) throw error(404, 'list not found');

    const data = await request.formData();
    const fullName = String(data.get('full_name') ?? '').trim();
    if (!fullName) return fail(400, { error: 'name is required' });

    const companyName = String(data.get('company') ?? '').trim();
    const company = companyName ? findOrCreateCompany(d, companyName) : null;

    const priorityRaw = String(data.get('priority') ?? '').trim();
    const priority = priorityRaw ? Priority.parse(priorityRaw) : null;

    const contact = createContact(
      d,
      {
        full_name: fullName,
        company_id: company?.id ?? null,
        role: String(data.get('role') ?? '').trim() || null,
      },
      { listId: list.id },
    );
    assignToList(d, { list_id: list.id, contact_id: contact.id, priority });
    throw redirect(303, `/contacts/${contact.id}`);
  },

  archive: ({ params }) => {
    const list = findListByPrefix(db(), params.id);
    if (!list) throw error(404, 'list not found');
    archiveList(db(), list.id);
    throw redirect(303, '/lists');
  },
};
