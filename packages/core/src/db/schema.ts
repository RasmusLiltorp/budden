import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const tsCols = {
  created_at: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updated_at: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

export const lists = sqliteTable('lists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  goal: text('goal'),
  status: text('status').notNull().default('active'),
  ...tsCols,
});

export const companies = sqliteTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  website: text('website'),
  description: text('description'),
  notes: text('notes'),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown> | null>(),
  ...tsCols,
});

export const contacts = sqliteTable(
  'contacts',
  {
    id: text('id').primaryKey(),
    company_id: text('company_id').references(() => companies.id, { onDelete: 'set null' }),
    full_name: text('full_name').notNull(),
    role: text('role'),
    notes: text('notes'),
    metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown> | null>(),
    ...tsCols,
  },
  (t) => ({
    companyIdx: index('contacts_company_idx').on(t.company_id),
    nameIdx: index('contacts_name_idx').on(t.full_name),
  }),
);

export const channels = sqliteTable(
  'channels',
  {
    id: text('id').primaryKey(),
    contact_id: text('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    handle: text('handle').notNull(),
    is_primary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
    verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
    created_at: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    contactIdx: index('channels_contact_idx').on(t.contact_id),
    handleIdx: index('channels_handle_idx').on(t.type, t.handle),
  }),
);

export const list_memberships = sqliteTable(
  'list_memberships',
  {
    id: text('id').primaryKey(),
    list_id: text('list_id')
      .notNull()
      .references(() => lists.id, { onDelete: 'cascade' }),
    contact_id: text('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('not_contacted'),
    priority: text('priority'),
    assigned_to: text('assigned_to'),
    added_at: integer('added_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    status_changed_at: integer('status_changed_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    uniq: uniqueIndex('list_memberships_uniq').on(t.list_id, t.contact_id),
    listIdx: index('list_memberships_list_idx').on(t.list_id),
    statusIdx: index('list_memberships_status_idx').on(t.list_id, t.status),
  }),
);

export const interactions = sqliteTable(
  'interactions',
  {
    id: text('id').primaryKey(),
    list_id: text('list_id')
      .notNull()
      .references(() => lists.id, { onDelete: 'cascade' }),
    contact_id: text('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    channel_type: text('channel_type').notNull(),
    direction: text('direction').notNull(),
    subject: text('subject'),
    body: text('body'),
    occurred_at: integer('occurred_at', { mode: 'timestamp_ms' }).notNull(),
    created_at: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown> | null>(),
  },
  (t) => ({
    contactIdx: index('interactions_contact_idx').on(t.contact_id),
    listContactIdx: index('interactions_list_contact_idx').on(t.list_id, t.contact_id),
    occurredIdx: index('interactions_occurred_idx').on(t.occurred_at),
  }),
);
