import { db } from '$lib/server/db';
import {
  channelsForContact,
  findContactByPrefix,
  getCompany,
  interactionsForContact,
  logInteraction,
  membershipsWithListsForContact,
  setStatus,
} from '@budden/core';
import { Direction, InteractionChannel, MembershipStatus, parseOccurredAt } from '@budden/shared';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
  const d = db();
  const contact = findContactByPrefix(d, params.id);
  if (!contact) throw error(404, 'contact not found');

  return {
    contact,
    company: contact.company_id ? getCompany(d, contact.company_id) : null,
    channels: channelsForContact(d, contact.id),
    memberships: membershipsWithListsForContact(d, contact.id),
    interactions: interactionsForContact(d, contact.id),
  };
};

export const actions: Actions = {
  log: async ({ params, request }) => {
    const d = db();
    const contact = findContactByPrefix(d, params.id);
    if (!contact) throw error(404, 'contact not found');

    const data = await request.formData();
    const listId = String(data.get('list_id') ?? '');
    if (!listId) return fail(400, { error: 'list is required' });

    const direction = Direction.parse(data.get('direction') ?? 'outbound');
    const channel = direction === 'note' ? 'other' : InteractionChannel.parse(data.get('channel'));

    logInteraction(d, {
      list_id: listId,
      contact_id: contact.id,
      channel_type: channel,
      direction,
      subject: String(data.get('subject') ?? '').trim() || null,
      body: String(data.get('body') ?? '').trim() || null,
      occurred_at: parseOccurredAt(String(data.get('at') ?? '') || undefined),
    });

    throw redirect(303, `/contacts/${contact.id}`);
  },

  setStatus: async ({ params, request }) => {
    const d = db();
    const contact = findContactByPrefix(d, params.id);
    if (!contact) throw error(404, 'contact not found');

    const data = await request.formData();
    const listId = String(data.get('list_id') ?? '');
    const status = MembershipStatus.parse(data.get('status'));

    try {
      setStatus(d, listId, contact.id, status);
    } catch (e) {
      return fail(400, { error: e instanceof Error ? e.message : 'invalid status transition' });
    }
    throw redirect(303, `/contacts/${contact.id}`);
  },
};
