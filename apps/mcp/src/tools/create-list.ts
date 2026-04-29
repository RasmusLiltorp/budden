import { createList } from '@budden/core';
import { z } from 'zod';
import { ok, type Tool } from '../types';

export const createListTool: Tool<{
  name: z.ZodString;
  description: z.ZodOptional<z.ZodString>;
  goal: z.ZodOptional<z.ZodString>;
}> = {
  name: 'create_list',
  description:
    'Create a new outreach list (campaign / project). Use when the user wants to start tracking a new batch of contacts ("set up a list for Q3 fundraising", "new campaign for design partner research").',
  inputSchema: {
    name: z.string().min(1),
    description: z.string().optional(),
    goal: z.string().optional(),
  },
  handler: ({ name, description, goal }, { db }) =>
    ok({ list: createList(db, { name, description, goal }) }),
};
