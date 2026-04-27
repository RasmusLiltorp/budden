import type { Tool } from '../types';
import { addChannelTool } from './add-channel';
import { addContactTool } from './add-contact';
import { archiveListTool } from './archive-list';
import { createListTool } from './create-list';
import { getContactTool } from './get-contact';
import { getListTool } from './get-list';
import { listContactsTool } from './list-contacts';
import { listListsTool } from './list-lists';
import { logInteractionTool } from './log-interaction';
import { followupQueueTool, inboxTool, todayQueueTool } from './queues';
import { searchTool } from './search';
import { setStatusTool } from './set-status';
import { updateContactTool } from './update-contact';

// biome-ignore lint/suspicious/noExplicitAny: Tools have heterogeneous schemas; the registry needs the wide type.
export const allTools: Tool<any>[] = [
  listListsTool,
  getListTool,
  createListTool,
  archiveListTool,
  listContactsTool,
  getContactTool,
  addContactTool,
  updateContactTool,
  addChannelTool,
  logInteractionTool,
  setStatusTool,
  todayQueueTool,
  followupQueueTool,
  inboxTool,
  searchTool,
];
