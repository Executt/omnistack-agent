import { createHash } from 'node:crypto';

const SEP = '\n\n---\n\n';

/** 12-char sha256 hex of a string. */
export function contentHash(str) {
  return createHash('sha256').update(str, 'utf8').digest('hex').slice(0, 12);
}

/** coreFiles: Array<{ name, body }> already sorted by name. */
export function assembleCore(coreFiles) {
  return coreFiles.map((f) => f.body.trim()).join(SEP);
}

/**
 * modules: Array<{ path, body }>; indexBody: string; mode: 'full' | 'lean'.
 * lean -> only the navigation index. full -> index + every module, path-sorted.
 */
export function assembleKnowledge(modules, indexBody, mode) {
  if (mode === 'lean') return indexBody.trim();
  const ordered = [...modules].sort((a, b) => a.path.localeCompare(b.path));
  return [indexBody.trim(), ...ordered.map((m) => m.body.trim())].join(SEP);
}

/** target: { name, outPath, mode, frontmatter: string|null }. */
export function renderTarget(target, coreStr, knowledgeStr) {
  const body = [coreStr, knowledgeStr].filter(Boolean).join(SEP);
  const header =
    '<!-- GENERATED from core/ + knowledge/ — DO NOT EDIT — run: npm run build -->\n' +
    `<!-- content-hash: ${contentHash(body)} -->`;
  const fm = target.frontmatter ? `${target.frontmatter.trim()}\n\n` : '';
  return `${fm}${header}\n\n${body}\n`;
}

const CLAUDE_DESC =
  'Full Stack Software Engineering Specialist — architecture, OOP, databases, ' +
  'DevOps, testing, and technical writing across the whole SDLC.';

/** Declarative adapter table. Add a platform = add a row here. */
export const TARGETS = [
  {
    name: 'claude-skill',
    outPath: 'adapters/claude/SKILL.md',
    mode: 'full',
    frontmatter: `---\nname: omnistack-agent\ndescription: ${CLAUDE_DESC}\nuser-invocable: true\n---`,
  },
  {
    name: 'claude-agent',
    outPath: 'adapters/claude/agent.md',
    mode: 'full',
    frontmatter: `---\nname: omnistack-agent\ndescription: ${CLAUDE_DESC}\nmodel: claude-sonnet-4-6\n---`,
  },
  { name: 'claude-agents-md', outPath: 'adapters/claude/AGENTS.md', mode: 'full', frontmatter: null },
  { name: 'chatgpt-gpt', outPath: 'adapters/chatgpt/custom-gpt-instructions.md', mode: 'lean', frontmatter: null },
  { name: 'chatgpt-system', outPath: 'adapters/chatgpt/system-prompt.md', mode: 'full', frontmatter: null },
  { name: 'copilot', outPath: 'adapters/copilot/copilot-instructions.md', mode: 'lean', frontmatter: null },
  { name: 'gemini', outPath: 'adapters/gemini/gem-instructions.md', mode: 'lean', frontmatter: null },
  { name: 'cursor', outPath: 'adapters/cursor/AGENTS.md', mode: 'full', frontmatter: null },
  { name: 'generic', outPath: 'adapters/generic/system-prompt.md', mode: 'full', frontmatter: null },
];
