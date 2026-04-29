import {
  type DB,
  findContactByPrefix,
  findListByPrefix,
  membershipsForContact,
} from '@budden/core';
import type { Contact, List } from '@budden/shared';
import { fail } from './util';

export const requireList = (db: DB, idOrPrefix: string): List => {
  const list = findListByPrefix(db, idOrPrefix);
  if (!list) fail(`no list matching ${idOrPrefix}`);
  return list;
};

export const requireContact = (db: DB, idOrPrefix: string): Contact => {
  const contact = findContactByPrefix(db, idOrPrefix);
  if (!contact) fail(`no contact matching ${idOrPrefix}`);
  return contact;
};

export const resolveListForContact = (
  db: DB,
  contactId: string,
  listOpt: string | undefined,
): string => {
  if (listOpt) return requireList(db, listOpt).id;
  const memberships = membershipsForContact(db, contactId);
  if (memberships.length === 0) fail('contact is not in any list — pass --list');
  if (memberships.length > 1) fail(`contact is in ${memberships.length} lists — pass --list`);
  return memberships[0]!.list_id;
};
