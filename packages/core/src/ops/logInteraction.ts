import type { Interaction, LogInteractionInput } from '@budden/shared';
import type { DB } from '../db/client';
import { events } from '../events';
import { insertInteraction } from '../repos/interactions';
import { assignToList, getMembership, setStatus } from '../repos/memberships';
import { canTransition, inferStatusFromInteraction } from '../status';

export const logInteraction = (db: DB, input: LogInteractionInput): Interaction => {
  let membership = getMembership(db, input.list_id, input.contact_id);
  if (!membership) {
    membership = assignToList(db, { list_id: input.list_id, contact_id: input.contact_id });
  }

  const interaction = insertInteraction(db, input);
  events.emit('interaction.logged', { interaction });

  const next = inferStatusFromInteraction(membership.status, input.direction);
  if (next && next !== membership.status && canTransition(membership.status, next)) {
    setStatus(db, input.list_id, input.contact_id, next);
  }

  return interaction;
};
