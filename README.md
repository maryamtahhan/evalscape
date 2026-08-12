# Evalscape

A visual landscape of AI model benchmarking tools and evaluation frameworks — searchable, filterable, and organized by category.

**Live site:** https://maryamtahhan.github.io/evalscape/

---

## What's in it

42 tools across 10 categories:

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

Each tool card shows:
- Organization logo
- Description
- Hardware support (CPU / GPU)
- Benchmark type badge
- GitHub stars and forks

Click any card to open a detail modal with metrics, license, and a link to the repo.

---

## Running locally

No build step. Just open `index.html` in a browser:

```bash
git clone https://github.com/maryamtahhan/evalscape.git
cd evalscape
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

Or serve it with any static file server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
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
  stars: 1234,             // GitHub stargazers_count
  forks: 56,               // GitHub forks_count
  description: 'One or two sentences describing what the tool measures and how.',
  category: 'inference',   // must match a category id
  hardware: ['cpu', 'gpu'],
  types: ['online'],       // see type values below
  url: 'https://github.com/org/repo',
  license: 'Apache 2.0',
  org: 'Org Name',
  metrics: [
    'Metric one',
    'Metric two',
  ],
  tags: ['tag1', 'tag2'],
},
```

**Valid `types` values:** `online`, `offline`, `quality`, `code`, `agent`, `rag`, `embedding`, `audio`, `safety`, `multimodal`, `security`

2. If adding a new category, add it to the `categories` array and update `catEmoji`, `TYPE_LABELS`, `TYPE_CLASS` in `app.js`, the filter list in `index.html`, and the badge CSS variables in `style.css`.

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

---

## Contributing

Pull requests are welcome — especially for:
- New tools or benchmarks that are missing
- Corrected descriptions or metrics
- Updated GitHub star counts
- Better logos

Please keep descriptions factual and concise (1–2 sentences), and verify that any GitHub stats you add come from the canonical repository for the tool.
