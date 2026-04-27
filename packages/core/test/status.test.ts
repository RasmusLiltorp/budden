import { describe, expect, test } from 'bun:test';
import { canTransition, inferStatusFromInteraction } from '../src/status';

describe('status state machine', () => {
  test('valid linear path', () => {
    expect(canTransition('not_contacted', 'contacted')).toBe(true);
    expect(canTransition('contacted', 'replied')).toBe(true);
    expect(canTransition('replied', 'in_conversation')).toBe(true);
    expect(canTransition('in_conversation', 'booked')).toBe(true);
    expect(canTransition('booked', 'closed_won')).toBe(true);
  });

  test('do_not_contact reachable from any state', () => {
    expect(canTransition('not_contacted', 'do_not_contact')).toBe(true);
    expect(canTransition('booked', 'do_not_contact')).toBe(true);
    expect(canTransition('closed_won', 'do_not_contact')).toBe(true);
  });

  test('invalid transitions rejected', () => {
    expect(canTransition('not_contacted', 'booked')).toBe(false);
    expect(canTransition('closed_won', 'contacted')).toBe(false);
    expect(canTransition('do_not_contact', 'contacted')).toBe(false);
  });

  test('inferStatusFromInteraction', () => {
    expect(inferStatusFromInteraction('not_contacted', 'outbound')).toBe('contacted');
    expect(inferStatusFromInteraction('contacted', 'inbound')).toBe('replied');
    expect(inferStatusFromInteraction('not_contacted', 'inbound')).toBe('replied');
    expect(inferStatusFromInteraction('contacted', 'note')).toBe(null);
    expect(inferStatusFromInteraction('booked', 'outbound')).toBe(null);
  });
});
