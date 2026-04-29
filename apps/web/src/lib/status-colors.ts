import type { MembershipStatus } from '@budden/shared';

const COLORS: Record<MembershipStatus, string> = {
  not_contacted: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  contacted: 'bg-blue-950 text-blue-300 border-blue-800',
  replied: 'bg-amber-950 text-amber-300 border-amber-800',
  in_conversation: 'bg-amber-950 text-amber-300 border-amber-800',
  booked: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  closed_won: 'bg-emerald-900 text-emerald-200 border-emerald-700',
  closed_lost: 'bg-red-950 text-red-300 border-red-800',
  do_not_contact: 'bg-red-950 text-red-300 border-red-800',
};

export const statusClasses = (s: MembershipStatus): string => COLORS[s];
