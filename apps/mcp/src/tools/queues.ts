import { findListByPrefix, getFollowupQueue, getInbox, getTodayQueue } from '@budden/core';
import { z } from 'zod';
import { type Tool, err, ok } from '../types';

export const todayQueueTool: Tool<{ list_id: z.ZodString }> = {
  name: 'get_today_queue',
  description: 'High-priority not-yet-contacted leads for a list, sorted by priority.',
  inputSchema: { list_id: z.string().min(1) },
  handler: ({ list_id }, { db }) => {
    const list = findListByPrefix(db, list_id);
    if (!list) return err(`no list matching ${list_id}`);
    return ok({ list, items: getTodayQueue(db, list.id) });
  },
};

export const followupQueueTool: Tool<{
  list_id: z.ZodString;
  lookback_days: z.ZodOptional<z.ZodNumber>;
}> = {
  name: 'get_followup_queue',
  description: 'Contacts that need follow-up (contacted but no inbound reply within lookback).',
  inputSchema: {
    list_id: z.string().min(1),
    lookback_days: z.number().int().positive().optional(),
  },
  handler: ({ list_id, lookback_days }, { db }) => {
    const list = findListByPrefix(db, list_id);
    if (!list) return err(`no list matching ${list_id}`);
    return ok({ list, items: getFollowupQueue(db, list.id, lookback_days ?? 5) });
  },
};

export const inboxTool: Tool<{ list_id: z.ZodOptional<z.ZodString> }> = {
  name: 'get_inbox',
  description:
    'Contacts who replied and are awaiting response. Optional list_id to scope to one list.',
  inputSchema: { list_id: z.string().min(1).optional() },
  handler: ({ list_id }, { db }) => {
    let scopedListId: string | undefined;
    if (list_id) {
      const list = findListByPrefix(db, list_id);
      if (!list) return err(`no list matching ${list_id}`);
      scopedListId = list.id;
    }
    return ok({ items: getInbox(db, scopedListId) });
  },
};
