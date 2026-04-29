import { archiveList, findListByPrefix } from '@budden/core';
import { z } from 'zod';
import { err, ok, type Tool } from '../types';

export const archiveListTool: Tool<{ id: z.ZodString }> = {
  name: 'archive_list',
  description:
    'Archive a list. Archived lists are hidden from list_lists by default but their contacts and history are preserved. Use when a campaign is over.',
  inputSchema: { id: z.string().min(1) },
  handler: ({ id }, { db }) => {
    const list = findListByPrefix(db, id);
    if (!list) return err(`no list matching ${id}`);
    archiveList(db, list.id);
    return ok({ archived: { id: list.id, name: list.name } });
  },
};
