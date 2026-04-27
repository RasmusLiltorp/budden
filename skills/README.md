# Budden skills

Workflow skills for using Budden through Claude. Each skill teaches Claude a specific outreach workflow on top of the Budden MCP server's tools.

## What's here

| Skill | When Claude should invoke it |
|---|---|
| [budden-morning-ritual](./budden-morning-ritual/) | "What's on my plate today?" — daily campaign check-in |
| [budden-log-outreach](./budden-log-outreach/) | "I just messaged X on LinkedIn" — record an outbound send |
| [budden-followup-sweep](./budden-followup-sweep/) | "Draft follow-ups for everyone in [list]" — review queue + propose messages |
| [budden-triage-inbox](./budden-triage-inbox/) | "Anyone replied?" — summarise inbox + suggest next actions |
| [budden-add-prospect](./budden-add-prospect/) | "Add [person] to [list]" — create a contact with channels and assignment |

## Install

These skills assume you have the Budden MCP server already configured (see the project [README](../README.md#mcp-setup) for stdio + Claude Desktop / Code setup).

### Project-scoped (this repo only)

Skills under `.claude/skills/` are auto-loaded by Claude Code when working inside this repo:

```bash
mkdir -p .claude/skills
cp -r skills/budden-* .claude/skills/
```

### User-scoped (everywhere)

```bash
mkdir -p ~/.claude/skills
cp -r skills/budden-* ~/.claude/skills/
```

Restart Claude Code or your Claude Desktop session and the skills become available. Claude will offer to invoke them when your message matches a skill's trigger description.

## Skill design notes

Each skill follows Anthropic's [SKILL.md format](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview):

- **YAML frontmatter** (`name`, `description`) is what Claude reads to decide whether to invoke the skill. Description includes both *what* and *when*.
- **Markdown body** is loaded only when Claude picks the skill — keep it focused on the workflow, not background.
- All skills are under 5,000 words to stay well within the context budget.

If you want to add your own skill, follow the same pattern. The Budden MCP exposes 13 tools (`list_lists`, `get_list`, `list_contacts`, `get_contact`, `add_contact`, `update_contact`, `add_channel`, `log_interaction`, `set_status`, `get_today_queue`, `get_followup_queue`, `get_inbox`, `search`) that any skill can compose.

## The "user always sends" invariant

Budden never sends actual messages. The MCP tools only **record** that the user sent something. Every skill that involves outreach should:

1. Have Claude draft the message
2. Hand it to the user to actually send (in LinkedIn, email, Discord, etc.)
3. Only call `log_interaction` *after* the user confirms the send happened

Skills enforce this so Claude doesn't fabricate sends in the CRM that never happened in real life.
