import { listLists } from '@budden/core';
import { z } from 'zod';
import { type Tool, ok } from '../types';

export const listListsTool: Tool<{ include_archived: z.ZodOptional<z.ZodBoolean> }> = {
  name: 'list_lists',
  description: 'Show all lists (active by default).',
  inputSchema: { include_archived: z.boolean().optional() },
  handler: ({ include_archived }, { db }) =>
    ok({ lists: listLists(db, { includeArchived: include_archived }) }),
};
