import {
  channelsForContact,
  getCompany,
  interactionsForContact,
  membershipsForContact,
} from '@budden/core';
import { Command } from 'commander';
import { withDb } from '../../db';
import { requireContact } from '../../resolve';
import { formatId, isJson, printJson, truncate } from '../../util';

export const showCmd = new Command('show').argument('<id>').action((id: string) => {
  withDb((db) => {
    const contact = requireContact(db, id);
    const channels = channelsForContact(db, contact.id);
    const memberships = membershipsForContact(db, contact.id);
    const interactions = interactionsForContact(db, contact.id);
    const company = contact.company_id ? getCompany(db, contact.company_id) : null;

    if (isJson()) {
      return printJson({ contact, company, channels, memberships, interactions });
    }

    const role = contact.role ? ` — ${contact.role}` : '';
    console.log(`${contact.full_name} [${formatId(contact.id)}]${role}`);
    if (company) console.log(`Company: ${company.name}`);
    if (contact.notes) console.log(`Notes: ${contact.notes}`);

    if (channels.length) {
      console.log('\nChannels:');
      for (const ch of channels) {
        const primary = ch.is_primary ? ' (primary)' : '';
        console.log(`  ${ch.type}: ${ch.handle}${primary}`);
      }
    }
    if (memberships.length) {
      console.log('\nLists:');
      for (const m of memberships) console.log(`  ${formatId(m.list_id)} — ${m.status}`);
    }
    if (interactions.length) {
      console.log('\nInteractions:');
      for (const i of interactions.slice(0, 10)) {
        const date = i.occurred_at.toISOString().slice(0, 10);
        const text = truncate(i.body ?? i.subject ?? '', 60);
        console.log(`  ${date} ${i.direction.padEnd(8)} ${i.channel_type.padEnd(10)} ${text}`);
      }
    }
  });
});
