import type { Contact, Interaction, List, ListMembership, MembershipStatus } from '@budden/shared';

export type EventMap = {
  'list.created': { list: List };
  'contact.created': { contact: Contact; listId?: string };
  'interaction.logged': { interaction: Interaction };
  'membership.status_changed': {
    membership: ListMembership;
    from: MembershipStatus;
    to: MembershipStatus;
  };
  'followup.due': { membership: ListMembership; daysSinceLastContact: number };
};

type Handler<E extends keyof EventMap> = (payload: EventMap[E]) => void | Promise<void>;

export class TypedEmitter {
  private handlers: { [K in keyof EventMap]?: Handler<K>[] } = {};

  on<E extends keyof EventMap>(event: E, handler: Handler<E>): () => void {
    if (!this.handlers[event]) this.handlers[event] = [];
    const list = this.handlers[event] as Handler<E>[];
    list.push(handler);
    return () => {
      const idx = list.indexOf(handler);
      if (idx >= 0) list.splice(idx, 1);
    };
  }

  emit<E extends keyof EventMap>(event: E, payload: EventMap[E]): void {
    const list = (this.handlers[event] ?? []) as Handler<E>[];
    for (const h of list) {
      void h(payload);
    }
  }
}

export const events = new TypedEmitter();
