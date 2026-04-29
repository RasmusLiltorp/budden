---
name: budden-triage-inbox
description: Review contacts who have replied and propose next actions. Invoke when the user asks "anyone replied?", "what's in my inbox", "who needs a response", or wants to triage the Budden inbox. Pulls inbox items, reads each contact's recent thread, and suggests one specific next move per contact (reply, schedule call, mark closed, etc.).
---

# Budden — triage inbox

## When to run this

The user wants to know who replied and decide what to do about it. Inbox items are contacts in `replied` status — someone wrote back and the next move is on the user.

## Steps

1. **Pull the inbox.** Call `get_inbox` (no list_id for everything; pass `list_id` if the user scoped it to one campaign). If empty, tell the user "Inbox zero." and stop.

2. **For each item, fetch the recent thread.** Call `get_contact` and look at the most recent inbound interaction's `body`. That's what they said.

3. **Classify the reply.** Each reply usually falls into one of:
   - **Interested** — wants to hear more / book a call / engage further
   - **Not now** — polite decline, may revisit later
   - **Not a fit** — explicit no
   - **Question** — wants info before deciding
   - **Unclear** — short or ambiguous (e.g. "thanks", "ok")

4. **Suggest one action per contact.** Based on the classification:
   - Interested → draft a reply that proposes a specific next step (calendar link, demo, intro)
   - Question → draft a reply that answers the question
   - Not now → suggest setting status to `in_conversation` if there's room to nurture, or `closed_lost` if it's clearly dead
   - Not a fit → suggest `closed_lost` or `do_not_contact` per their tone
   - Unclear → suggest a short clarifying reply

5. **Show the user the triage as a list.** Format:

   ```
   ## Jake Gaba — interested
   They said: "Sounds interesting, can you tell me more about pricing?"

   Suggested action: Reply with the pricing tier breakdown.

   Draft:
   > Hey Jake — quick rundown: [...]
   ```

6. **Wait for the user to act.** Same rule as `budden-followup-sweep`: never log a send before the user confirms they sent it.

7. **Log confirmed sends + status changes.**
   - Confirmed reply sent → `log_interaction(direction=outbound, ...)`. Auto-transition will move them from `replied` to `in_conversation`.
   - User says "mark Jane as closed lost" → `set_status(status="closed_lost")`.
   - User says "Tom's not a fit, never contact again" → `set_status(status="do_not_contact")`.

## Status transitions reference

The state machine in Budden enforces what's reachable. From `replied` you can go to:
- `in_conversation` (continued thread)
- `closed_lost`
- `do_not_contact`

You **cannot** jump from `replied` directly to `booked` or `closed_won` — those require going through `in_conversation` first. If the user wants to mark someone "they said yes, going to demo", set `in_conversation` first; once the demo is actually booked, transition to `booked`.

## Hard rules

- **Show the actual reply text** in the triage, even if long. The user needs to see what was said before deciding the action.
- **One specific action per contact**, not a menu of options. If you're unsure, ask the user before drafting.
- **`do_not_contact` is terminal.** Don't suggest it lightly — it's for explicit "stop" signals or compliance situations.
