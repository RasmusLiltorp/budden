import type { MembershipStatus } from '@budden/shared';

const TRANSITIONS: Record<MembershipStatus, MembershipStatus[]> = {
  not_contacted: ['contacted', 'do_not_contact'],
  contacted: ['replied', 'in_conversation', 'closed_lost', 'do_not_contact'],
  replied: ['in_conversation', 'closed_lost', 'do_not_contact'],
  in_conversation: ['booked', 'closed_lost', 'do_not_contact'],
  booked: ['closed_won', 'closed_lost', 'do_not_contact'],
  closed_won: ['do_not_contact'],
  closed_lost: ['do_not_contact'],
  do_not_contact: [],
};

export const canTransition = (from: MembershipStatus, to: MembershipStatus): boolean => {
  if (from === to) return true;
  return TRANSITIONS[from]?.includes(to) ?? false;
};

export const assertTransition = (from: MembershipStatus, to: MembershipStatus): void => {
  if (!canTransition(from, to)) {
    throw new Error(`invalid status transition: ${from} -> ${to}`);
  }
};

export const inferStatusFromInteraction = (
  current: MembershipStatus,
  direction: 'outbound' | 'inbound' | 'note',
): MembershipStatus | null => {
  if (direction === 'note') return null;
  if (direction === 'outbound' && current === 'not_contacted') return 'contacted';
  if (direction === 'inbound' && (current === 'contacted' || current === 'not_contacted')) {
    return 'replied';
  }
  return null;
};
