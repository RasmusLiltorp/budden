---
name: budden-followup-sweep
description: Draft follow-up messages for contacts who haven't replied to outreach. Invoke when the user says "draft follow-ups", "who needs a nudge", "write a follow-up for [list]", or asks to review the follow-up queue. Pulls the queue, reads each contact's history, drafts a personalised message, and only logs the send AFTER the user confirms they sent it.
---

# Budden — follow-up sweep

## When to run this

The user wants help working through their follow-up queue: contacts they reached out to who haven't replied within the lookback window.

## Steps

1. **Resolve the list.** If the user named one ("Acme list"), use `search` or `list_lists` to find its ID. If they didn't name a list, ask which campaign — don't sweep all lists at once.

2. **Pull the queue.** Call `get_followup_queue` with the `list_id`. Default lookback is 5 days; if the user specifies otherwise ("everyone overdue 10 days") pass `lookback_days`.

3. **For each contact in the queue, fetch context.** Call `get_contact` to get:
   - Full interaction history (what was the original outbound message?)
   - Channels (which one did the user reach them on?)
   - Notes (any context to personalise around)
   - Company info if any

4. **Draft a follow-up per contact.** Read the original outbound and write a fresh, short, non-pushy follow-up that references the previous message naturally. Examples of good:
   - "Hey Jake — circling back on the design partnership idea. Any thoughts?"
   - "Robin, following up on my note about Minecraft tooling — happy to chat if there's interest."

   Avoid:
   - "Just bumping this to the top of your inbox" (cliché)
   - Multi-paragraph re-pitches (the original message already pitched)
   - Apologising for following up

5. **Show the drafts to the user.** Group by contact, with the original message excerpted underneath each draft so the user can see the thread. Use this format:

   ```
   ## Jake Gaba (linkedin) — 7 days since contacted
   Original: "Hey Jake, I'm working on tooling for Minecraft server ops..."

   Draft:
   > Hey Jake — circling back on the design partnership idea. Any thoughts?
   ```

6. **Wait for the user to send.** They'll send the actual messages in LinkedIn / email / wherever. Then they confirm: "Sent the first three" or "Sent all of them" or "Skipped Robin, sent the rest".

7. **Log only the confirmed sends.** For each one the user confirms sending, call `log_interaction` with `direction=outbound`, the right `channel_type`, and the draft body. Do NOT log anything before the user confirms.

## Hard rules

- **Never auto-send.** Budden has no send integrations. The MCP tool only records.
- **Never log a draft as sent.** A draft you wrote is not an interaction until the user confirms they sent it in real life.
- **Skip contacts in `do_not_contact` status.** They shouldn't be in the queue, but if they are (manual override), don't draft for them.
- **One follow-up per contact.** Don't suggest multiple drafts and let the user pick — pick the best one, show it once. The user can edit before sending.

## Edge cases

- If `get_followup_queue` returns empty, tell the user "No follow-ups due in [list]." and stop.
- If a contact's last outbound was more than 30 days ago, the relationship is cold — note this and ask if the user wants to draft a warmer re-introduction or just leave them.
- If there's an inbound interaction newer than the contact's `status_changed_at` but the membership is still `contacted`, that's a data inconsistency — the queue shouldn't include them. Trust the queue but mention it to the user.
