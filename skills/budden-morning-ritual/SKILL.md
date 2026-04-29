---
name: budden-morning-ritual
description: Daily check-in for outreach campaigns in Budden CRM. Invoke when the user asks "what's on my plate today", "morning briefing", "what should I work on", "any replies", or any variation that asks for a status snapshot across active lists. Surfaces the today queue, follow-ups due, and inbox for each active list, ranked by priority.
---

# Budden — morning ritual

## When to run this

The user wants a snapshot of where their outreach stands right now. They want to know who to message, who to follow up with, and who has replied — across all active campaigns.

## Steps

1. Call `list_lists` (no args). This returns active campaigns. If empty, tell the user they have no active lists and ask if they want to create one (note: list creation is via CLI/web — `budden list create "Name"` — not MCP).

2. For each list returned, call all three queue tools in parallel:
   - `get_today_queue` with `list_id` — high-priority not-yet-contacted leads
   - `get_followup_queue` with `list_id` and default lookback — contacted but no reply, past 5 days
   - `get_inbox` with `list_id` — replied, awaiting response

3. Format the output as a tight per-list briefing. Lead with the list with the most actionable items. Example:

   ```
   ## Acme Q3 outreach
   - 📨 Inbox (3): Jake Gaba, Robin Brämer, Sarah Chen
   - ⏰ Follow-ups due (2): Tom Kim (7d), Alice Park (6d)
   - 🎯 Today (5 high-priority): Jake's co-founder, ...
   ```

4. **Don't dump JSON.** The MCP tools return structured data on purpose. Format it as a readable briefing.

5. **Don't suggest next actions in the briefing itself.** The user might want to:
   - Ask you to draft replies to inbox items → invoke `budden-triage-inbox`
   - Ask you to draft follow-ups → invoke `budden-followup-sweep`
   - Just glance and dismiss

   Wait for them to ask. End the briefing with one short line like "Want me to draft anything?".

## Tool order matters

Always `list_lists` first. Don't assume list IDs — even if the user has mentioned a list before, fetch fresh.

For lists with zero items in all three queues, omit the list from the briefing entirely. No empty sections.

## Edge cases

- If a list has only inbox items (no follow-ups due, no today queue), still include it — replies are time-sensitive.
- If a list has been archived, it won't appear in `list_lists`. That's correct.
- If the user has 10+ active lists, prioritise: lists with inbox > lists with follow-ups due > lists with only today queue. Show the top 5 fully and note "+ N other lists with X today / Y follow-ups due" at the bottom.
