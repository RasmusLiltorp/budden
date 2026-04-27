---
name: budden-log-outreach
description: Record an outbound message, reply, or note in Budden CRM. Invoke when the user says they sent / messaged / emailed / DMed / called / met someone, OR when they want to log a note about a contact ("Robin mentioned at the conference that..."). Identifies the contact, picks the right list, and calls log_interaction with the correct direction.
---

# Budden — log an outreach event

## When to run this

The user is telling you they did something with a contact:
- "I just messaged Jake on LinkedIn about the design partnership"
- "Sent the follow-up to Robin"
- "Emailed Sarah at Acme — pitched the demo"
- "Note: Tom said he's not buying this quarter"
- "Got on a call with the Indifferent Broccoli founder"

## Steps

1. **Identify the contact.** Use `search` with the name (or any identifying string the user gave). Show the user the matches and confirm if there's ambiguity. If no match, offer to invoke `budden-add-prospect` to create them first.

2. **Pick the list.** Call `get_contact` to see which lists they're in. Decision tree:
   - One list → use it.
   - Multiple lists → ask the user which campaign this belongs to. Do not guess.
   - Zero lists → ask the user which list to add them to first, then invoke `budden-add-prospect` or use the CLI.

3. **Determine the direction.**
   - "I messaged / sent / emailed / called" → `outbound`
   - "They replied / responded / wrote back / said" → `inbound`
   - "Note that..." / "FYI..." / context the user wants saved without it being a real exchange → `note`

4. **Determine the channel.**
   - LinkedIn / DM / Twitter / Discord / phone / email — use the matching `channel_type`.
   - Notes always use `channel_type: "other"`.
   - In-person meetings are `in_person`.

5. **Call `log_interaction`** with `contact_id`, `list_id`, `direction`, `channel_type`, and `body` (what was said, summarised if the user gave a long account).

6. **Confirm what changed.** If the contact was `not_contacted` and you logged outbound, mention that they automatically moved to `contacted`. If they were `contacted` and you logged inbound, mention they moved to `replied`. The status state machine is automatic in Budden — surface it so the user knows.

## What this skill does NOT do

- **Never invents content.** If the user says "I messaged Jake on LinkedIn", the body is whatever the user told you. Don't fabricate a message.
- **Never sends messages.** Budden has no outbound integrations. The user always sends in the actual channel themselves; you're just recording it.
- **Never skips the contact lookup.** Always confirm you have the right person before logging — wrong contact gets the wrong status transition.

## Examples

User: *"Logged my LinkedIn DM to Jake at Indifferent Broccoli — pitched the design partnership thing"*

You:
1. `search` → confirm Jake Gaba matches
2. `get_contact` → he's in "Minecraft SaaS research" only
3. `log_interaction(contact_id, list_id, direction=outbound, channel_type=linkedin, body="Pitched the design partnership")`
4. Reply: "Logged. Jake is now in `contacted` status (was `not_contacted`)."

User: *"Tom mentioned at the conference that he's hiring — make a note"*

You:
1. `search` → Tom Kim
2. `get_contact` → he's in "Q3 cold outreach"
3. `log_interaction(contact_id, list_id, direction=note, channel_type=other, body="Mentioned at conference he is hiring")`
4. Reply: "Note saved on Tom's record. No status change."
