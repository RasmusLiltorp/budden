import type { DB } from '../db/client';
import { channelsForContact } from '../repos/channels';
import { getContact } from '../repos/contacts';
import { membershipsForList } from '../repos/memberships';
import { csvEscape } from './csv-parse';

const HEADERS = ['id', 'name', 'role', 'email', 'linkedin', 'notes'] as const;

export const exportCsv = (db: DB, listId: string): string => {
  const lines = [HEADERS.join(',')];
  for (const m of membershipsForList(db, listId)) {
    const contact = getContact(db, m.contact_id);
    if (!contact) continue;
    const channels = channelsForContact(db, contact.id);
    const email = channels.find((x) => x.type === 'email')?.handle ?? '';
    const linkedin = channels.find((x) => x.type === 'linkedin')?.handle ?? '';
    const cells = [
      contact.id,
      contact.full_name,
      contact.role ?? '',
      email,
      linkedin,
      contact.notes ?? '',
    ];
    lines.push(cells.map(csvEscape).join(','));
  }
  return lines.join('\n');
};
