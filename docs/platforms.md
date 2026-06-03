# Platform Install Guide

omnistack-agent ships pre-generated adapter files for every supported platform. You never run a build to *use* the agent — just copy the listed file's contents and paste it where the platform expects its instructions. This guide gives a short, concrete walkthrough for each of the six platforms.

> Adapters come in two depths. **Full** adapters carry the complete knowledge base inline; **lean** adapters carry the agent's brain plus the knowledge index (the agent still reasons from its full identity and principles, with the index as a map). Pick the variant that fits your platform's instruction-size limits.

---

## ChatGPT (Custom GPT)

File: [`adapters/chatgpt/custom-gpt-instructions.md`](../adapters/chatgpt/custom-gpt-instructions.md) (lean) or [`adapters/chatgpt/system-prompt.md`](../adapters/chatgpt/system-prompt.md) (full)

1. In ChatGPT, go to **Explore GPTs → Create** (requires a paid plan).
2. Open the **Configure** tab.
3. Copy the entire contents of `custom-gpt-instructions.md` and paste it into the **Instructions** box.
4. Give the GPT a name and avatar, then **Save / Update** and choose your visibility.
5. If you want the full knowledge base inline instead, use `system-prompt.md` in the same field.

## Claude (Skill)

File: [`adapters/claude/SKILL.md`](../adapters/claude/SKILL.md) (full)

1. Create the folder `.claude/skills/omnistack-agent/` in your project (or your user-level Claude config).
2. Copy `SKILL.md` into it as `SKILL.md` — it already includes the required YAML frontmatter (`name`, `description`, `user-invocable: true`).
3. Restart or reload Claude Code so it discovers the skill.
4. Invoke it by name when you want the omnistack-agent persona.

## Claude (Agent)

File: [`adapters/claude/agent.md`](../adapters/claude/agent.md) (full); repo-wide alternative: [`adapters/claude/AGENTS.md`](../adapters/claude/AGENTS.md)

1. Create the folder `.claude/agents/` in your project if it doesn't exist.
2. Copy `agent.md` into it — the frontmatter already sets the agent `name`, `description`, and `model`.
3. Reload Claude Code; the subagent becomes available for delegation.
4. Alternatively, drop `AGENTS.md` at your repository root to apply the guidance repo-wide instead of as a named subagent.

## GitHub Copilot

File: [`adapters/copilot/copilot-instructions.md`](../adapters/copilot/copilot-instructions.md) (lean)

1. At your repository root, create the folder `.github/` if it doesn't exist.
2. Save the file as `.github/copilot-instructions.md`.
3. Commit it so the whole team shares the same instructions.
4. Reload your editor (or restart the Copilot extension) to pick up the file.

## Gemini (Gem)

File: [`adapters/gemini/gem-instructions.md`](../adapters/gemini/gem-instructions.md) (lean)

1. Open Gemini and go to **Gems → New Gem**.
2. Copy the contents of `gem-instructions.md` into the **Instructions** field.
3. Name the Gem (e.g. "omnistack-agent") and **Save**.
4. Select the Gem from your list whenever you want the specialist persona.

## Cursor / Windsurf

File: [`adapters/cursor/AGENTS.md`](../adapters/cursor/AGENTS.md) (full)

1. Copy the file to your project root as `AGENTS.md`.
2. Cursor and Windsurf read `AGENTS.md` automatically — no extra configuration is needed.
3. Commit it so the guidance travels with the repository.
4. Reload the editor if it was already open.

## Generic (any LLM)

File: [`adapters/generic/system-prompt.md`](../adapters/generic/system-prompt.md) (full)

1. Copy the entire file contents.
2. Paste it as the **system prompt** of your chat session, or as the `system` message in an API request (OpenAI, Anthropic, Mistral, a local model, etc.).
3. Start your conversation — the agent now operates as the Full Stack Software Engineering Specialist.
