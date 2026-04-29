import { search } from '@budden/core';
import { z } from 'zod';
import { ok, type Tool } from '../types';

export const searchTool: Tool<{ query: z.ZodString }> = {
  name: 'search',
  description: 'Free-text search across contacts, companies, and interaction bodies.',
  inputSchema: { query: z.string().min(1) },
  handler: ({ query }, { db }) => ok(search(db, query)),
};
