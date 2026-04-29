import type { Company, Contact, Interaction } from '@budden/shared';
import type { DB } from '../db/client';
import { searchCompanies } from '../repos/companies';
import { searchContacts } from '../repos/contacts';
import { searchInteractions } from '../repos/interactions';

export type SearchResult = {
  contacts: Contact[];
  companies: Company[];
  interactions: Interaction[];
};

export const search = (db: DB, q: string): SearchResult => ({
  contacts: searchContacts(db, q),
  companies: searchCompanies(db, q),
  interactions: searchInteractions(db, q),
});
