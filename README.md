# Evalscape

A visual landscape of AI model benchmarking tools and evaluation frameworks — searchable, filterable, and organized by category.

**Live site:** https://maryamtahhan.github.io/evalscape/

---

## Features

- **Search & filter** by hardware, benchmark type, use case, and status
- **Tools, Leaderboards & Standards** — three pillars for choosing eval tools, ranking models, and understanding conformance requirements
- **Sort** by stars, name, or last-reviewed date
- **Shareable URLs** — filters and deep links persist in the query string (`?type=rag&hw=gpu&tool=ragas`)
- **Find a tool wizard** — answer 3 questions to get recommendations
- **Compare** up to 3 tools side-by-side
- **Tool enrichment** — deployment model, adoption signals, output formats, datasets, and model compatibility in each detail modal
- **Related tools** and extra resource links (docs, papers, Hugging Face) in each detail modal
- **Auto-refreshed GitHub stats** via weekly GitHub Action
- **Schema validation** in CI for contributor data quality

---

## What's in it

47 tools across 10 categories, plus **31 public leaderboards** and **10 evaluation standards** covering model rankings, governance frameworks (NIST AI RMF, ISO 42001), industry benchmarks (MLPerf, SPEC ML), and regulations (EU AI Act).

| Category | What it covers |
|---|---|
| ⚡ Inference Benchmarking | Throughput, latency, TTFT, ITL under load |
| 📊 LLM Quality & Accuracy | Holistic model evaluation across reasoning, knowledge, fairness |
| 💻 Code Generation | Functional correctness, patch resolution, real-world coding tasks |
| 🤖 Agent & Tool Use | Function calling, web agents, multi-step task completion |
| 🔍 RAG & Retrieval Evaluation | Faithfulness, relevancy, context quality for RAG pipelines |
| 🔢 Embedding Quality | Retrieval, classification, clustering, semantic similarity |
| 🎙️ Audio & Speech | ASR accuracy (WER), real-time factor, multi-domain speech |
| 🛡️ Safety & Alignment | Truthfulness, jailbreak resistance, harm refusal |
| 🖼️ Multimodal | Image/video understanding, visual reasoning, cross-modal QA |
| 🔒 Security & Vulnerability | Red-teaming, vulnerability localization, code security |

Each tool card shows organization info, description, hardware support, benchmark type badges, and GitHub stars/forks. Click any card for full details, related tools, and resource links.

---

## Running locally

No build step required for the site itself. Just open `index.html` in a browser:

```bash
git clone https://github.com/maryamtahhan/evalscape.git
cd evalscape
open index.html          # macOS
```

Or serve it with any static file server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

To validate data changes:

```bash
npm install
npm run validate
```

To manually refresh GitHub star counts:

```bash
npm run refresh-stars
```

---

## Adding a tool

1. Add an entry to the `tools` array in `data.js`:

```js
{
  id: 'my-tool',           // unique kebab-case id
  name: 'My Tool',
  shortName: 'MyTool',     // shown in dense view
  initials: 'MT',          // shown if no logo
  logo: 'logos/my-tool.png', // optional — drop image in logos/
  stars: 1234,
  forks: 56,
  description: 'One or two sentences describing what the tool measures and how.',
  category: 'inference',   // must match a category id
  hardware: ['cpu', 'gpu'],
  types: ['online'],
  url: 'https://github.com/org/repo',
  docs: 'https://docs.example.com',       // optional
  paper: 'https://arxiv.org/abs/...',     // optional
  huggingface: 'https://huggingface.co/...', // optional
  license: 'Apache 2.0',
  org: 'Org Name',
  status: 'active',        // active | experimental | archived
  lastReviewed: '2026-08-01',
  useCases: ['pre-production', 'ci-friendly'],
  related: ['vllm-serve', 'llmperf'],
  metrics: ['Metric one', 'Metric two'],
  tags: ['tag1', 'tag2'],
  // Optional enrichment (or add to TOOL_META in data.js):
  hosting: 'library',              // self-hosted | saas | both | library
  adoption: 'research',            // research | production | both
  modelScope: 'agnostic',          // agnostic | openai-compatible | provider-specific | huggingface
  foundation: 'MLCommons',         // optional backing org
  outputFormats: ['json', 'html'],
  datasets: ['MMLU', 'HumanEval'],
},
```

**Valid `types` values:** `online`, `offline`, `quality`, `code`, `agent`, `rag`, `embedding`, `audio`, `safety`, `multimodal`, `security`

**Valid `useCases` values:** `pre-production`, `ci-friendly`, `leaderboard`, `production-monitoring`, `research`, `api-benchmarking`, `cost-analysis`

2. Run `npm run validate` to check your entry against the JSON schema.

3. If adding a new category, add it to the `categories` array and update `catEmoji`, `TYPE_LABELS`, `TYPE_CLASS` in `app.js`, the filter list in `index.html`, and the badge CSS variables in `style.css`.

---

## Shareable URLs

| Parameter | Example | Description |
|---|---|---|
| `q` | `?q=ragas` | Search query |
| `hw` | `?hw=gpu` | Hardware filter |
| `type` | `?type=rag` | Benchmark type |
| `useCase` | `?useCase=ci-friendly` | Use case filter |
| `status` | `?status=active` | Tool status |
| `sort` | `?sort=stars` | Sort order |
| `view` | `?view=dense` | View mode |
| `section` | `?section=leaderboards` | Show leaderboards instead of tools |
| `section` | `?section=standards` | Show evaluation standards |
| `standardType` | `?standardType=governance` | Filter standards by type |
| `tool` | `?tool=ragas` | Open tool detail modal |
| `leaderboard` | `?leaderboard=chatbot-arena` | Open leaderboard detail modal |
| `standard` | `?standard=nist-ai-rmf` | Open standard detail modal |
| `compare` | `?compare=ragas,deepeval` | Pre-select compare list |

---

## Adding a leaderboard

Add an entry to the `leaderboards` array in `leaderboards.js` (see existing entries for the full shape). Each leaderboard links to a public ranking site and can reference related eval tools from `data.js` via `relatedTools`.

Run `npm run validate` after adding entries.

---

## Adding a standard

Add an entry to the `standards` array in `standards.js`. Focus on evaluation-relevant standards — governance frameworks (NIST AI RMF, ISO 42001), industry benchmarks (MLPerf, SPEC ML), regulations (EU AI Act), and portable specifications (OpenTelemetry GenAI).

Each standard should include a `conformance` field explaining what eval evidence practitioners need, plus optional `relatedTools` and `relatedLeaderboards` cross-references.

Run `npm run validate` after adding entries.

---

## Adding a logo

Drop a square PNG or SVG (128×128 recommended, transparent background) into `logos/` named after the tool id:

```
logos/my-tool.png
```

Then set `logo: 'logos/my-tool.png'` on the tool entry. If omitted, the card displays the `initials` string instead.

---

## Deployment

The site deploys automatically to GitHub Pages via GitHub Actions on every push to `main`. No configuration needed beyond enabling Pages in the repo settings:

**Settings → Pages → Source → GitHub Actions**

A separate workflow validates `data.js` on every PR, and another refreshes GitHub star counts weekly.

---

## Contributing

Pull requests are welcome — especially for:

- New tools or benchmarks that are missing
- Corrected descriptions or metrics
- Updated GitHub star counts
- Better logos
- Related-tool suggestions

Please keep descriptions factual and concise (1–2 sentences), run `npm run validate` before submitting, and verify that any GitHub stats come from the canonical repository.
