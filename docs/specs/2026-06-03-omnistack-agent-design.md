# omnistack-agent — Documento de Design (Spec)

- **Data:** 2026-06-03
- **Autor:** Ricardo Moretti (com Claude Code / brainstorming)
- **Status:** Aprovado para planejamento de implementação
- **Tipo:** Projeto open-source — agente de IA agnóstico de plataforma

---

## 1. Visão geral

`omnistack-agent` é um **agente de IA open-source, agnóstico de plataforma**, que atua como um
**Full Stack Software Engineering Specialist** completo. Ele combina, em um único agente, os papéis
de Arquiteto de Software, Desenvolvedor Full Stack, Mobile, Backend, Frontend, DBA, DevOps, QA,
Technical Writer e Mentor — sempre seguindo boas práticas, com **foco primário em Programação
Orientada a Objetos (classes, objetos, atributos, princípios de design)**.

O projeto é distribuído como um **repositório modular**: o conteúdo real (o "cérebro" do agente)
vive em um único lugar (`core/` + `knowledge/`) e é **compilado automaticamente** para arquivos
de "adaptadores" prontos para cada plataforma de IA (ChatGPT, Claude, Copilot, Gemini, Cursor/Windsurf
e um prompt genérico universal).

### 1.1 Objetivos
- Ser **agnóstico de plataforma**: funciona em ChatGPT, OpenAI Agents, Claude, Copilot, Gemini,
  Antigravity, LLMs open-source e sistemas futuros.
- Ser **fácil de usar**: clonar e copiar o arquivo do adaptador desejado — sem build obrigatório.
- Ser **fácil de contribuir**: editar um único lugar (`core/`/`knowledge/`), rodar `npm run build`, abrir PR.
- Ser **fácil de navegar/achar as coisas**: hub de índice, `core/` numerado, adaptadores por plataforma.
- Ser **muito bem documentado**: README rico (uso + contribuição + imagem no topo) e docs dedicados.
- **"Não deixar nada pra trás"**: respostas de alta qualidade, confiáveis e production-ready.

### 1.2 Não-objetivos (v1)
- Não é um app/CLI executável — é um conjunto de prompts + base de conhecimento (markdown).
- Não cobre exaustivamente **toda** linguagem/framework na v1 — entrega um **núcleo completo** + módulos-chave,
  e a comunidade expande.
- Não inclui integração automática de instalação em cada plataforma (apenas instruções).

---

## 2. Decisões de design (travadas)

| Decisão | Escolha | Motivo |
|---|---|---|
| Nome do projeto | `omnistack-agent` | Curto, memorável, "todas as camadas da stack" |
| Formato | Repositório agnóstico modular | Atende agnosticismo + contribuição + manutenção |
| Idioma do conteúdo | **Bilíngue** (conteúdo EN, docs/README EN+PT-BR) | Alcance global + preferência PT-BR do autor |
| Escopo v1 | Núcleo completo + expansão pela comunidade | Equilíbrio qualidade × tempo |
| Adaptadores v1 | Todos (Claude, ChatGPT, Copilot, Gemini, Cursor, genérico) | Adaptadores são "casquinhas" finas sobre o mesmo núcleo |
| Licença | **MIT** | Mais permissiva/popular, amigável a contribuição e uso comercial |
| Persona | **Papel neutro** ("Full Stack Software Engineering Specialist") | Profissional, atemporal, adotável em qualquer contexto |
| Sincronização núcleo↔adaptadores | **Fonte única + script de build** (Abordagem A) | Zero duplicação, zero drift, CI valida |

---

## 3. Arquitetura — estrutura do repositório

```
omnistack-agent/
├── README.md                     # Landing bilíngue (EN principal + link PT-BR) + banner no topo
├── README.pt-BR.md               # Versão em português (espelho)
├── LICENSE                       # MIT
├── CONTRIBUTING.md               # Como contribuir (seções EN/PT)
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md                  # Versionamento semântico
├── package.json                  # scripts: build / validate (Node nativo, ~zero deps)
│
├── assets/
│   └── banner.svg                # Imagem/hero do topo do README (SVG, renderiza no GitHub)
│
├── core/                         # ★ FONTE ÚNICA — "o cérebro" do agente (EN)
│   ├── 00-identity.md            # Papel, missão, persona neutra, tom
│   ├── 01-principles.md          # Clean Code, SOLID, DRY/KISS/YAGNI, OOP-first
│   ├── 02-capabilities.md        # Os 10 papéis e o que cada um entrega
│   ├── 03-workflow.md            # Método nas 12 etapas do ciclo de vida
│   ├── 04-interaction-style.md   # Como responde, formato, quando perguntar, modo mentor
│   └── 05-guardrails.md          # Honestidade/anti-alucinação, segurança, production-ready
│
├── knowledge/                    # ★ BASE MODULAR — expansível (EN)
│   ├── _index.md                 # Mapa de TODOS os módulos (hub de navegação)
│   ├── oop/                      #   ◀ FOCO PRIMÁRIO
│   │   ├── classes-objects-attributes.md
│   │   ├── pillars.md            #   encapsulamento, herança, polimorfismo, abstração
│   │   ├── solid.md
│   │   └── design-patterns.md
│   ├── languages/                # csharp.md, javascript.md, html-css.md, …
│   ├── frontend/                 # react.md, web-fundamentals.md, …
│   ├── backend/                  # apis.md, microservices.md, …
│   ├── mobile/                   # native.md, cross-platform.md, …
│   ├── databases/                # relational.md, non-relational.md, modeling.md (ER/DER)
│   ├── architecture/             # scalability.md, patterns.md, …
│   ├── devops/                   # ci-cd.md, iac.md, cloud.md, …
│   ├── testing/                  # automated.md, manual-qa.md, …
│   ├── security/                 # best-practices.md, …
│   └── documentation/            # technical-writing.md, …
│
├── adapters/                     # ★ GERADO (não editar à mão) — só copiar e usar
│   ├── claude/                   # SKILL.md + agent.md + AGENTS.md
│   ├── chatgpt/                  # custom-gpt-instructions.md + system-prompt.md
│   ├── copilot/                  # copilot-instructions.md
│   ├── gemini/                   # gem-instructions.md
│   ├── cursor/                   # AGENTS.md / .cursorrules
│   └── generic/                  # system-prompt.md (universal)
│
├── scripts/
│   ├── build.mjs                 # monta core+knowledge → adapters (Node nativo)
│   └── validate.mjs              # CI: garante que adapters estão em sincronia (hash)
│
├── examples/                     # conversas/usos de exemplo por papel
├── docs/
│   ├── architecture.md           # como o repo funciona (fonte única → build → adapters)
│   ├── adding-knowledge.md       # guia de contribuição: criar um módulo novo
│   ├── platforms.md              # passo a passo de instalação por IA
│   └── specs/                    # este documento e specs futuros
└── .github/
    ├── workflows/ci.yml          # roda validate (sincronia) + lint markdown
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE.md
```

### 3.1 O que torna fácil de achar/clonar
1. `knowledge/_index.md` = hub único que lista e linka cada módulo.
2. `core/` numerado (00→05) = ordem de leitura óbvia.
3. `adapters/` por plataforma = "quer usar no ChatGPT? abra `adapters/chatgpt/`".
4. Clone leve: sem dependências pesadas; build opcional para quem só consome.
5. `docs/platforms.md` = instalação passo a passo em cada IA.

---

## 4. Anatomia do `core/` (fonte única)

| Arquivo | Conteúdo |
|---|---|
| `00-identity.md` | Papel = *Full Stack Software Engineering Specialist*; missão; papéis que encarna; tom sênior, direto, sem paternalismo; nota bilíngue |
| `01-principles.md` | Clean Code, **SOLID**, DRY/KISS/YAGNI, **mentalidade OOP-first**, design principles, barra de qualidade "não deixa nada pra trás" |
| `02-capabilities.md` | Os 10 papéis: Arquiteto, Full Stack, Mobile, Backend, Frontend, DBA, DevOps, QA, Technical Writer, Mentor — com o que cada um entrega |
| `03-workflow.md` | Método nas 12 etapas: requisitos → design → BD → backend → frontend → mobile → API → cloud → DevOps → testes → docs → manutenção |
| `04-interaction-style.md` | Pergunta quando ambíguo; entrega código completo (não trechos); cita caminhos; explica trade-offs; progressivo (iniciante→avançado); modo mentor |
| `05-guardrails.md` | Honestidade/anti-alucinação (cita docs oficiais quando incerto), segurança por padrão, sem operações destrutivas, código production-ready |

---

## 5. Template de módulo de conhecimento

Todo módulo em `knowledge/**` segue a **mesma forma** (facilita contribuição e leitura):

```markdown
# <Tópico>
> Resumo de 1 linha + quando isso importa

## Conceitos        (fundamentos)
## Boas práticas
## Padrões & Exemplos (código real, comentado)
## Armadilhas comuns / Anti-padrões
## Referências       (docs oficiais / normas)

<!-- level: beginner | intermediate | advanced -->
```

### 5.1 Módulos-chave da v1 (núcleo completo)
- `oop/` — classes-objects-attributes, pillars, solid, design-patterns (**foco primário**)
- `architecture/` — scalability, patterns
- `databases/` — relational, non-relational, modeling (ER/DER)
- `testing/` — automated, manual-qa
- `languages/` — csharp, javascript, html-css (sementes; comunidade adiciona mais)
- Demais pastas criadas com `_index` + ao menos um módulo semente para guiar contribuição.

---

## 6. Sistema de build (`scripts/build.mjs`)

- **Entrada:** `core/` (ordem 00→05) + `knowledge/**`.
- **Saída:** arquivos em `adapters/**`, com **frontmatter injetado por plataforma**:
  - Claude `SKILL.md`: `name`, `description`, `user-invocable: true`.
  - Claude `agent.md`: `name`, `description`, `model`.
  - Demais: header/comentário apropriado.
- **Dois modos de montagem por adaptador** (cada IA tem limite de tamanho diferente):
  - **`full`** → todo o conhecimento embutido (ex.: `generic/system-prompt.md`, Claude).
  - **`lean`** → núcleo + índice/resumos linkados (ex.: Copilot, Gemini — pedem prompts curtos).
- **Marcação anti-drift:** cada arquivo gerado começa com
  `<!-- GERADO de core/ + knowledge/ — NÃO EDITAR — rode: npm run build -->` + um **hash de conteúdo**.
- **`validate.mjs`** recalcula o hash no **CI**; se algum adaptador estiver desatualizado, **reprova o PR**.
- **Sem dependências pesadas:** Node nativo (`fs`, `crypto`, `path`); `package.json` define
  `"build"` e `"validate"`.

### 6.1 Configuração de adaptadores (no build)
Tabela declarativa no `build.mjs` (uma linha por alvo): `{ target, outPath, mode, frontmatter }`.
Adicionar uma nova plataforma = adicionar uma linha + (se necessário) um pequeno template.

---

## 7. Documentação

### 7.1 `README.md` (muito bem documentado, com imagem no topo)
Ordem:
1. **🖼️ Banner** (`assets/banner.svg`) no topo.
2. **Badges**: MIT · PRs welcome · plataformas suportadas. Link **🇧🇷 Ler em Português** (`README.pt-BR.md`).
3. **O que é** (1 parágrafo) + lista de capacidades (os 10 papéis).
4. **▶️ Como usar** — tabela *Plataforma → arquivo do adaptador → passo a passo* (ChatGPT, Claude, Copilot, Gemini, Cursor, genérico).
5. **🤝 Como contribuir** — fluxo resumido (fork → edita `core/`/`knowledge/` → `npm run build` → PR) + link `CONTRIBUTING.md`.
6. **🗂️ Estrutura do repo** (mini-mapa) · **🛣️ Roadmap** · **📄 Licença**.

`README.pt-BR.md` espelha o conteúdo em português.

### 7.2 Docs dedicados
- `docs/architecture.md` — como o repo funciona (fonte única → build → adapters; anti-drift).
- `docs/adding-knowledge.md` — passo a passo para criar um módulo novo (usa o template da seção 5).
- `docs/platforms.md` — instalação detalhada por IA.

### 7.3 Banner
- `assets/banner.svg`: nome do projeto, tagline e estética tech limpa; SVG autoral (texto), renderiza no GitHub.
- Substituível depois por PNG/arte custom sem mudar o README (mesmo caminho de arquivo).

---

## 8. Meta open-source
- `CONTRIBUTING.md` (EN+PT): setup, fluxo, padrão de módulo, "rode `npm run build` antes do PR".
- `CODE_OF_CONDUCT.md` (Contributor Covenant).
- `.github/ISSUE_TEMPLATE/` (bug, novo módulo de conhecimento, melhoria) + `PULL_REQUEST_TEMPLATE.md`.
- `.github/workflows/ci.yml`: roda `npm run validate` (sincronia) + lint de markdown.
- `CHANGELOG.md` + versionamento semântico (SemVer).
- `LICENSE`: MIT.

---

## 9. Critérios de sucesso (v1)
1. `git clone` + abrir `adapters/<plataforma>/` → arquivo pronto para colar e usar.
2. Editar `core/` + `npm run build` → todos os adaptadores regenerados de forma idêntica/consistente.
3. `npm run validate` reprova adaptador desatualizado (anti-drift comprovado).
4. README com banner no topo, seção de uso e de contribuição completas, em EN e PT-BR.
5. `knowledge/_index.md` lista 100% dos módulos existentes.
6. Núcleo (`core/` 00→05) completo e coerente; módulos-chave da seção 5.1 presentes.
7. CI verde no push inicial.

---

## 10. Roadmap pós-v1 (comunidade)
- Mais módulos de linguagens/frameworks (Python, Go, Rust, Vue, Angular, Flutter, etc.).
- Mais adaptadores (Antigravity, LLMs open-source específicos).
- Exemplos por papel em `examples/`.
- Tradução completa dos módulos de conhecimento para PT-BR (opcional).
- Testes automatizados do build (snapshot dos adaptadores).
```
