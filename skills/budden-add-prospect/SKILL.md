---
name: budden-add-prospect
description: Create a new contact in Budden CRM with company, role, channels, and optional list assignment. Invoke when the user says "add [person]", "new prospect", "save [name] to [list]", or describes a person they want to track. Handles single contacts and small batches; for CSV imports point them to the import page or `budden import csv`.
---

# Budden — add a prospect

## When to run this

The user wants to track a new person:
- "Add Robin Brämer, founder at Acme, to the Q3 list"
- "I met Tom Kim at the conference — head of design at Indifferent Broccoli, LinkedIn is linkedin.com/in/tomkim, save him to the design partner research"
- "Three new prospects: Jake Gaba (founder, Indifferent Broccoli), Sarah Chen (CTO, Acme), Robin Brämer (CEO, Beta)"

## Steps for a single contact

1. **Parse what the user gave you.** Pull out:
   - `full_name` (required)
   - `company` (optional — Budden auto-creates the company if it doesn't exist)
   - `role` (optional)
   - `notes` (optional — anything contextual: "met at conference", "intro from X")
   - `list_id` (optional — if they named a list, look it up via `list_lists` or `search`)
   - `priority` (optional: high / medium / low)
   - `channels` (optional — array of {type, handle}; e.g. `[{type: "linkedin", handle: "linkedin.com/in/jake"}]`)

2. **Resolve the list if named.** Don't guess. If they said "the Acme list", call `list_lists` and confirm the match. If multiple lists could match, ask.

3. **Call `add_contact`.** All in one tool call — it accepts `channels[]` and `list_id` so you don't need separate `add_channel` / `assign` calls for the common case.

4. **Confirm what got created.** Show the contact ID prefix and the list they landed in. Example: "Added Jake Gaba (Indifferent Broccoli) to Minecraft SaaS research as `not_contacted`, priority high. ID: `01KQ2C3A`."

## Steps for multiple contacts

If the user pastes a list of 3–10 prospects in one message:

1. Parse them into a structured list first. Show your parse to the user before calling any tools — confirm you got the names, roles, and target list right.

2. Once confirmed, call `add_contact` once per prospect. Don't try to batch into a single tool call (no batch tool exists; it would only obscure errors).

3. If any one fails, tell the user which one and continue with the rest. Don't abort the batch on a single failure.

## When to defer to CSV import

If the user has more than ~10 contacts or the data is in a structured format (sheet, exported CSV, copy-paste of a table):

- Tell them: "Easier to use the CSV import. Save those rows as CSV with headers like `name,email,linkedin,company,role` and run `budden import csv <file> --list <id>` (or paste into the web UI's Import page)."
- Don't try to parse a 50-row table by hand — you'll make mistakes and burn tokens.

## Channel tips

- LinkedIn handles can be a URL or just the slug — Budden stores both as-is, but be consistent.
- Mark the most-likely-to-reach channel as `is_primary: true`.
- Email channels default to `is_primary: true` if you don't specify, since email is the most common outreach channel. Override if the user said "reach out on LinkedIn first".

## Hard rules

- **Don't fabricate fields.** If the user didn't give a role, don't make one up. Leave it null.
- **Don't add to a list that doesn't exist.** If the user references a list you can't find, ask before creating — list creation is a CLI/web action, not an MCP tool, so you can't make one yourself.
- **Don't log fake interactions.** Adding a contact ≠ contacting them. Status starts at `not_contacted`. Only `log_interaction` (via the `budden-log-outreach` skill) moves status forward.

## Examples

User: *"Add Robin Brämer, founder at Indifferent Broccoli, met at conference last week, LinkedIn is linkedin.com/in/robinbramer, save to Minecraft research with high priority"*

You:
1. `list_lists` → find "Minecraft SaaS research" (id `01KQ...`)
2. `add_contact({
    full_name: "Robin Brämer",
    company: "Indifferent Broccoli",
    role: "Founder",
    notes: "Met at conference last week",
    channels: [{ type: "linkedin", handle: "linkedin.com/in/robinbramer", is_primary: true }],
    list_id: "01KQ...",
    priority: "high"
  })`
3. Reply: "Added Robin Brämer to Minecraft SaaS research, priority high. He's at not_contacted — say the word when you reach out and I'll log it."
