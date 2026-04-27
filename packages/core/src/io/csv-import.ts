import type { ChannelType } from '@budden/shared';
import type { DB } from '../db/client';
import { addChannel, findChannelByHandle } from '../repos/channels';
import { findOrCreateCompany } from '../repos/companies';
import { createContact } from '../repos/contacts';
import { assignToList } from '../repos/memberships';
import { parseCsv } from './csv-parse';

const KNOWN_CHANNEL_FIELDS: Record<string, ChannelType> = {
  email: 'email',
  linkedin: 'linkedin',
  twitter: 'twitter',
  discord: 'discord',
  phone: 'phone',
};

export type ImportResult = {
  created: number;
  linked: number;
  duplicates: number;
};

const findExistingByChannel = (db: DB, row: Record<string, string>): string | null => {
  for (const [field, type] of Object.entries(KNOWN_CHANNEL_FIELDS)) {
    const handle = row[field];
    if (!handle) continue;
    const existing = findChannelByHandle(db, type, handle);
    if (existing) return existing.contact_id;
  }
  return null;
};

const createFromRow = (db: DB, row: Record<string, string>, name: string): string => {
  const company = row.company ? findOrCreateCompany(db, row.company) : null;
  const contact = createContact(db, {
    full_name: name,
    company_id: company?.id ?? null,
    role: row.role ?? null,
    notes: row.notes ?? null,
  });
  for (const [field, type] of Object.entries(KNOWN_CHANNEL_FIELDS)) {
    const handle = row[field];
    if (!handle) continue;
    addChannel(db, { contact_id: contact.id, type, handle, is_primary: type === 'email' });
  }
  return contact.id;
};

export const importCsv = (db: DB, csvText: string, opts: { listId: string }): ImportResult => {
  const result: ImportResult = { created: 0, linked: 0, duplicates: 0 };

  for (const row of parseCsv(csvText)) {
    const name = row.name ?? row.full_name;
    if (!name) continue;

    const existingId = findExistingByChannel(db, row);
    let contactId: string;
    if (existingId) {
      contactId = existingId;
      result.duplicates++;
    } else {
      contactId = createFromRow(db, row, name);
      result.created++;
    }

    assignToList(db, { list_id: opts.listId, contact_id: contactId });
    result.linked++;
  }

  return result;
};
