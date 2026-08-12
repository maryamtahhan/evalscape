/* eslint-disable */
/* Evaluation standards, governance frameworks, and conformance requirements */

LANDSCAPE.standards = [

  // ── Inference ──────────────────────────────────────────────────────────────
  {
    id: 'spec-ml',
    name: 'SPEC ML',
    shortName: 'SPEC ML',
    initials: 'SP',
    description:
      'Vendor-neutral industry benchmark from the SPEC Machine Learning Committee measuring end-to-end ML system performance — data preparation, training, and inference across real-world workloads. Designed for procurement and capacity planning decisions.',
    category: 'inference',
    types: ['online', 'offline'],
    standardType: 'benchmark',
    url: 'https://www.spec.org/ml/',
    urlLabel: 'View on SPEC',
    org: 'SPEC',
    year: 2024,
    conformance:
      'Submissions must include: standardized workload results across data preparation, training, and inference phases; complete hardware spec sheet; full software stack and version manifest; and must be submitted for SPEC peer review before official publication.',
    relatedTools: ['mlperf'],
    relatedLeaderboards: ['mlperf-results'],
    tags: ['spec', 'industry-standard', 'end-to-end', 'procurement'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'mlperf-inference',
    name: 'MLPerf Inference',
    shortName: 'MLPerf Inference',
    initials: 'MI',
    description:
      'MLCommons industry benchmark suite with published submission rules for measuring inference performance across datacenter, edge, and mobile scenarios — covering vision, NLP, LLM, and recommendation workloads.',
    category: 'inference',
    types: ['online', 'offline'],
    standardType: 'benchmark',
    url: 'https://docs.mlcommons.org/inference/',
    urlLabel: 'View on MLCommons',
    org: 'MLCommons',
    year: 2024,
    conformance:
      'Submissions must include: accuracy validation logs proving ≥99% of FP32 reference accuracy; latency and throughput results under offline, server, and single-stream scenarios; complete hardware and software configuration; and must pass the MLCommons submission review checklist before results are published.',
    relatedTools: ['mlperf'],
    relatedLeaderboards: ['mlperf-results'],
    tags: ['mlcommons', 'inference', 'submission-rules'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'mlperf-training',
    name: 'MLPerf Training',
    shortName: 'MLPerf Training',
    initials: 'MT',
    description:
      'MLCommons training benchmark standardizing time-to-train measurements for image classification, object detection, NLP, recommendation, and LLM fine-tuning workloads.',
    category: 'inference',
    types: ['offline'],
    standardType: 'benchmark',
    url: 'https://docs.mlcommons.org/training/',
    urlLabel: 'View on MLCommons',
    org: 'MLCommons',
    year: 2024,
    conformance:
      'Submissions must include: time-to-train results using the MLCommons reference implementation; convergence validation against defined target quality thresholds; full hardware and software configuration; and must pass the MLCommons submission checklist for reproducibility verification.',
    relatedTools: ['mlperf'],
    tags: ['mlcommons', 'training', 'time-to-train'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },

  // ── LLM Quality & Accuracy ─────────────────────────────────────────────────
  {
    id: 'opentelemetry-genai',
    name: 'OpenTelemetry GenAI Semantic Conventions',
    shortName: 'OTel GenAI',
    initials: 'OT',
    description:
      'CNCF OpenTelemetry specification for standardized GenAI telemetry — defines portable span attributes for LLM calls, embeddings, retrieval, and tool use, enabling consistent eval observability across platforms. GenAI conventions remain in Development status and moved to a dedicated repository in June 2026.',
    category: 'quality',
    types: ['quality', 'rag', 'agent'],
    standardType: 'specification',
    url: 'https://github.com/open-telemetry/semantic-conventions-genai',
    urlLabel: 'View on OpenTelemetry',
    org: 'OpenTelemetry / CNCF',
    year: 2025,
    conformance:
      'Compliant tooling must emit at minimum: gen_ai.system, gen_ai.request.model, gen_ai.usage.input_tokens, and gen_ai.usage.output_tokens span attributes; structured events for prompts, completions, and tool calls; and trace IDs linkable to downstream eval metrics.',
    relatedTools: ['langsmith', 'arize-phoenix', 'wandb-weave'],
    tags: ['opentelemetry', 'cncf', 'telemetry', 'portable'],
    status: 'experimental',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'iso-iec-25059',
    name: 'ISO/IEC 25059 — SQuaRE for AI',
    shortName: 'ISO 25059',
    initials: 'IQ',
    description:
      'ISO/IEC 25059 extends the SQuaRE software quality framework (ISO 25010) to AI systems — defines quality characteristics including correctness, robustness, fairness, explainability, and transparency as measurable properties for AI system evaluation.',
    category: 'quality',
    types: ['quality', 'safety'],
    standardType: 'governance',
    url: 'https://www.iso.org/standard/80655.html',
    urlLabel: 'View on ISO',
    org: 'ISO / IEC',
    year: 2023,
    conformance:
      'Eval suites must measure and report against defined quality characteristics: correctness (accuracy on held-out test sets), robustness (out-of-distribution and adversarial test results), fairness (disaggregated performance across demographic groups), and explainability (human-interpretable rationale coverage on sampled outputs).',
    relatedTools: ['helm', 'deepeval', 'lm-eval'],
    tags: ['iso', 'software-quality', 'fairness', 'explainability', 'square'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'nist-sp-1270',
    name: 'NIST SP 1270 — Bias in AI',
    shortName: 'NIST SP 1270',
    initials: 'NB',
    description:
      'NIST Special Publication 1270 provides a framework for identifying and managing bias in AI systems — covering demographic bias, measurement bias, and evaluation bias, with guidance on bias testing methodology and selection of bias metrics.',
    category: 'quality',
    types: ['quality', 'safety'],
    standardType: 'specification',
    url: 'https://doi.org/10.6028/NIST.SP.1270',
    urlLabel: 'View on NIST',
    org: 'NIST',
    year: 2022,
    conformance:
      'Bias evaluations must: disaggregate accuracy metrics across demographic groups present in the test set; document data collection and annotation decisions that could introduce measurement bias; report subgroup performance gaps with statistical confidence bounds; and flag any group-level accuracy disparity exceeding the predefined threshold.',
    relatedTools: ['helm', 'lm-eval', 'deepeval'],
    tags: ['nist', 'bias', 'fairness', 'demographic', 'measurement'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },

  // ── Safety & Alignment ────────────────────────────────────────────────────
  {
    id: 'mlcommons-ai-safety',
    name: 'MLCommons AI Safety Benchmarks',
    shortName: 'MLCommons Safety',
    initials: 'MS',
    description:
      'MLCommons initiative developing standardized safety benchmarks and evaluation protocols for AI systems — the AILuminate v1.0 benchmark covers hazard categories including violent crimes, chemical/biological threats, and child safety across 33k expert-curated prompts.',
    category: 'safety',
    types: ['safety', 'quality'],
    standardType: 'benchmark',
    url: 'https://mlcommons.org/en/ailuminate/',
    urlLabel: 'View on MLCommons',
    org: 'MLCommons',
    year: 2024,
    conformance:
      'Eval runs must: use the defined AILuminate prompt dataset without modification; report per-hazard-category safe-response rates; document the model version, system prompt, and sampling parameters used; and submit results to the AILuminate leaderboard for peer comparison.',
    relatedTools: ['harmbench', 'garak'],
    tags: ['mlcommons', 'safety', 'ailuminate', 'harmonization'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'nist-ai-rmf',
    name: 'NIST AI Risk Management Framework',
    shortName: 'NIST AI RMF',
    initials: 'NI',
    description:
      'U.S. NIST voluntary framework for managing AI risks throughout the lifecycle. Defines Test, Evaluation, Verification, and Validation (TEVV) as a core function — mapped to the GOVERN, MAP, MEASURE, and MANAGE functions — for trustworthy AI deployment.',
    category: 'safety',
    types: ['safety', 'quality'],
    standardType: 'governance',
    url: 'https://doi.org/10.6028/NIST.AI.100-1',
    urlLabel: 'View NIST AI 100-1',
    org: 'NIST',
    year: 2023,
    conformance:
      'Your eval must produce: measurable metric definitions mapped to GOVERN/MAP/MEASURE/MANAGE functions; reproducible test scripts with version-pinned dependencies; documented risk severity ratings for each failing metric; and a traceable evidence package sufficient for an auditor to re-run and verify results.',
    relatedTools: ['helm', 'deepeval', 'ragas'],
    tags: ['nist', 'tevv', 'risk-management', 'trustworthy-ai'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'nist-genai-profile',
    name: 'NIST Generative AI Profile',
    shortName: 'NIST GenAI',
    initials: 'NG',
    description:
      'NIST companion resource to the AI RMF focused on generative AI risks — covers content provenance, hallucination, data privacy, and evaluation requirements specific to LLMs and diffusion models (NIST AI 600-1).',
    category: 'safety',
    types: ['safety', 'quality'],
    standardType: 'governance',
    url: 'https://doi.org/10.6028/NIST.AI.600-1',
    urlLabel: 'View NIST AI 600-1',
    org: 'NIST',
    year: 2024,
    conformance:
      'Your GenAI eval must report: hallucination rate on a factual held-out prompt set; refusal rate against a standardized harmful-prompt benchmark; data memorization probe results (verbatim extraction tests); and content provenance metadata coverage for sampled model outputs.',
    relatedTools: ['ragas', 'deepeval', 'truthfulqa'],
    tags: ['nist', 'generative-ai', 'llm', 'hallucination'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'iso-iec-42001',
    name: 'ISO/IEC 42001 — AI Management System',
    shortName: 'ISO 42001',
    initials: 'IS',
    description:
      'International certifiable standard for AI management systems — requires organizations to establish processes for AI impact assessment, performance monitoring, and continual improvement of AI systems.',
    category: 'safety',
    types: ['safety', 'quality'],
    standardType: 'governance',
    url: 'https://www.iso.org/standard/81230.html',
    urlLabel: 'View on ISO',
    org: 'ISO / IEC',
    year: 2023,
    conformance:
      'Your AI system\'s eval process must produce: a documented impact assessment; a defined set of KPIs with baseline and pass/fail thresholds; version-controlled test procedures with change history; and an audit trail of results across system versions sufficient for a third-party certification body to verify conformance.',
    relatedTools: ['helm', 'langsmith'],
    tags: ['iso', 'certification', 'management-system', 'audit'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'iso-iec-23894',
    name: 'ISO/IEC 23894 — AI Risk Management',
    shortName: 'ISO 23894',
    initials: 'I2',
    description:
      'ISO guidance on managing risks arising from AI systems — complements ISO 42001 with detailed risk identification, analysis, and treatment processes including evaluation and testing requirements.',
    category: 'safety',
    types: ['safety'],
    standardType: 'governance',
    url: 'https://www.iso.org/standard/77304.html',
    urlLabel: 'View on ISO',
    org: 'ISO / IEC',
    year: 2023,
    conformance:
      'Your eval plan must include: a risk register mapping each identified AI risk to specific test cases; documented coverage rationale explaining why each risk is sufficiently exercised; treatment records for any risk where eval thresholds are not met; and evidence of review sign-off by a named risk owner before deployment.',
    tags: ['iso', 'risk-management', 'guidance'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'eu-ai-act',
    name: 'EU Artificial Intelligence Act',
    shortName: 'EU AI Act',
    initials: 'EU',
    description:
      'EU regulation (2024/1689) establishing conformity assessment requirements for AI systems. Annex III defines high-risk categories — including CV screening, credit scoring, biometrics, and critical infrastructure — that require mandatory accuracy testing, robustness testing, and post-market monitoring before market placement.',
    category: 'safety',
    types: ['safety', 'security', 'quality'],
    standardType: 'regulation',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
    urlLabel: 'View on EUR-Lex',
    org: 'European Union',
    year: 2024,
    conformance:
      'High-risk AI systems (Annex III) must produce before market placement: accuracy and robustness test results on datasets representative of the intended geographic, contextual, and demographic scope; logged test conditions and outcomes; cybersecurity evaluation evidence; a technical documentation package meeting Article 11 requirements; and a post-market monitoring plan.',
    relatedTools: ['harmbench', 'garak', 'deepeval'],
    tags: ['regulation', 'eu', 'conformity-assessment', 'high-risk', 'annex-iii'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },

  // ── Security & Vulnerability ───────────────────────────────────────────────
  {
    id: 'owasp-llm-top10',
    name: 'OWASP LLM Top 10',
    shortName: 'OWASP LLM Top 10',
    initials: 'OW',
    description:
      'OWASP Top 10 for Large Language Model Applications catalogues the most critical security risks in LLM-powered systems — covering prompt injection, insecure output handling, training data poisoning, excessive agency, and sensitive information disclosure, with mitigation guidance for each.',
    category: 'security',
    types: ['security', 'safety'],
    standardType: 'governance',
    url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
    urlLabel: 'View on OWASP',
    org: 'OWASP',
    year: 2025,
    conformance:
      'Your red-team eval must: verify the model\'s exposure to each of the Top 10 risk items (LLM01–LLM10); produce a findings report mapping test cases to risk codes; and document pass/fail evidence for prompt injection (LLM01), sensitive data disclosure (LLM02), excessive agency (LLM08), and insecure output handling (LLM05) at minimum.',
    relatedTools: ['garak', 'harmbench', 'cyberseceval'],
    tags: ['owasp', 'security', 'prompt-injection', 'red-team', 'llm-risks'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'mitre-atlas',
    name: 'MITRE ATLAS',
    shortName: 'MITRE ATLAS',
    initials: 'MA',
    description:
      'MITRE Adversarial Threat Landscape for AI Systems — a knowledge base of adversarial ML attack techniques and case studies, structured as a matrix of tactics and techniques analogous to MITRE ATT&CK but focused on AI/ML systems.',
    category: 'security',
    types: ['security', 'safety'],
    standardType: 'specification',
    url: 'https://atlas.mitre.org/',
    urlLabel: 'View on MITRE',
    org: 'MITRE',
    year: 2023,
    conformance:
      'Security evals must: map tested attack scenarios to ATLAS tactic and technique IDs; document adversarial test coverage as a percentage of applicable ATLAS matrix entries; report findings using ATLAS technique IDs for cross-team traceability; and include at minimum evasion (AML.T0015), model inversion (AML.T0024), and prompt injection (AML.T0051) test coverage where applicable.',
    relatedTools: ['garak', 'harmbench', 'cyberseceval'],
    tags: ['mitre', 'atlas', 'adversarial-ml', 'attack-techniques', 'red-team'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
];

const lbIds = new Set((LANDSCAPE.leaderboards || []).map((lb) => lb.id));

LANDSCAPE.standards.forEach((s) => {
  s.status = s.status || 'active';
  s.lastReviewed = s.lastReviewed || '2026-08-12';
  s.relatedTools = s.relatedTools || [];
  s.relatedLeaderboards = (s.relatedLeaderboards || []).filter((id) => lbIds.has(id));
  s.urlLabel = s.urlLabel || (s.org ? `View on ${s.org}` : 'View official source');
});
