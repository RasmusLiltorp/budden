import { z } from 'zod';

export const ListStatus = z.enum(['active', 'archived']);
export type ListStatus = z.infer<typeof ListStatus>;

export const MembershipStatus = z.enum([
  'not_contacted',
  'contacted',
  'replied',
  'in_conversation',
  'booked',
  'closed_won',
  'closed_lost',
  'do_not_contact',
]);
export type MembershipStatus = z.infer<typeof MembershipStatus>;

export const Priority = z.enum(['high', 'medium', 'low']);
export type Priority = z.infer<typeof Priority>;

export const ChannelType = z.enum(['email', 'linkedin', 'twitter', 'discord', 'phone', 'other']);
export type ChannelType = z.infer<typeof ChannelType>;

export const InteractionChannel = z.enum([
  'email',
  'linkedin',
  'twitter',
  'discord',
  'phone',
  'in_person',
  'other',
]);
export type InteractionChannel = z.infer<typeof InteractionChannel>;

export const Direction = z.enum(['outbound', 'inbound', 'note']);
export type Direction = z.infer<typeof Direction>;
