/* eslint-disable */
/* Evaluation standards, governance frameworks, and conformance requirements */

LANDSCAPE.standards = [
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
    org: 'SPEC',
    year: 2024,
    conformance:
      'Demonstrates end-to-end ML pipeline throughput and latency under standardized workloads for apples-to-apples hardware and platform comparison.',
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
    url: 'https://mlcommons.org/benchmarks/inference/',
    org: 'MLCommons',
    year: 2024,
    conformance:
      'Results must follow MLCommons submission rules for latency, throughput, and accuracy under defined scenarios (offline, server, single-stream).',
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
    url: 'https://mlcommons.org/benchmarks/training/',
    org: 'MLCommons',
    year: 2024,
    conformance:
      'Training runs must meet MLCommons reference implementation and convergence criteria for comparable time-to-train reporting.',
    relatedTools: ['mlperf'],
    tags: ['mlcommons', 'training', 'time-to-train'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'mlcommons-ai-safety',
    name: 'MLCommons AI Safety Benchmarks',
    shortName: 'MLCommons Safety',
    initials: 'MS',
    description:
      'MLCommons initiative developing standardized safety benchmarks and evaluation protocols for AI systems — part of the broader effort to harmonize safety testing across the industry.',
    category: 'safety',
    types: ['safety', 'quality'],
    standardType: 'benchmark',
    url: 'https://mlcommons.org/working-groups/research/benchmarks/',
    org: 'MLCommons',
    year: 2024,
    conformance:
      'Provides community-agreed safety benchmark definitions and evaluation protocols for reproducible harm and robustness testing.',
    relatedTools: ['harmbench', 'garak'],
    tags: ['mlcommons', 'safety', 'harmonization'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'nist-ai-rmf',
    name: 'NIST AI Risk Management Framework',
    shortName: 'NIST AI RMF',
    initials: 'NI',
    description:
      'U.S. NIST voluntary framework for managing AI risks throughout the lifecycle. Defines Test, Evaluation, Verification, and Validation (TEVV) as a core function for trustworthy AI deployment.',
    category: 'safety',
    types: ['safety', 'quality'],
    standardType: 'governance',
    url: 'https://www.nist.gov/itl/ai-risk-management-framework',
    org: 'NIST',
    year: 2023,
    conformance:
      'Eval tooling should support TEVV documentation — measurable metrics, reproducible test procedures, and traceable results for risk assessment.',
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
      'NIST companion resource to the AI RMF focused on generative AI risks — covers content provenance, hallucination, data privacy, and evaluation requirements specific to LLMs and diffusion models.',
    category: 'safety',
    types: ['safety', 'quality'],
    standardType: 'governance',
    url: 'https://www.nist.gov/itl/ai-risk-management-framework/generative-ai-profile',
    org: 'NIST',
    year: 2024,
    conformance:
      'GenAI evaluations should address hallucination rates, harmful output refusal, data leakage, and content authenticity as outlined in the profile.',
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
    org: 'ISO / IEC',
    year: 2023,
    conformance:
      'Audit-ready eval records, documented test procedures, and monitored KPIs for AI system performance and safety.',
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
    org: 'ISO / IEC',
    year: 2023,
    conformance:
      'Risk-based eval planning with documented test coverage mapped to identified AI risks and mitigation controls.',
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
      'EU regulation establishing conformity assessment requirements for high-risk AI systems — mandates documentation, logging, accuracy testing, robustness testing, and post-market monitoring.',
    category: 'safety',
    types: ['safety', 'security', 'quality'],
    standardType: 'regulation',
    url: 'https://artificialintelligenceact.eu/',
    org: 'European Union',
    year: 2024,
    conformance:
      'High-risk AI deployments require documented eval evidence for accuracy, robustness, and cybersecurity before market placement.',
    relatedTools: ['harmbench', 'garak', 'deepeval'],
    tags: ['regulation', 'eu', 'conformity-assessment', 'high-risk'],
    status: 'active',
    lastReviewed: '2026-08-12',
  },
  {
    id: 'opentelemetry-genai',
    name: 'OpenTelemetry GenAI Semantic Conventions',
    shortName: 'OTel GenAI',
    initials: 'OT',
    description:
      'CNCF OpenTelemetry specification for standardized GenAI telemetry — defines portable span attributes for LLM calls, embeddings, retrieval, and tool use, enabling consistent eval observability across platforms.',
    category: 'quality',
    types: ['quality', 'rag', 'agent'],
    standardType: 'specification',
    url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/',
    org: 'OpenTelemetry / CNCF',
    year: 2025,
    conformance:
      'Eval and observability tools emitting OTel-compatible traces can integrate into standard monitoring pipelines without vendor lock-in.',
    relatedTools: ['langsmith', 'arize-phoenix', 'wandb-weave'],
    tags: ['opentelemetry', 'cncf', 'telemetry', 'portable'],
    status: 'experimental',
    lastReviewed: '2026-08-12',
  },
];

const lbIds = new Set((LANDSCAPE.leaderboards || []).map((lb) => lb.id));

LANDSCAPE.standards.forEach((s) => {
  s.status = s.status || 'active';
  s.lastReviewed = s.lastReviewed || '2026-08-12';
  s.relatedTools = s.relatedTools || [];
  s.relatedLeaderboards = (s.relatedLeaderboards || []).filter((id) => lbIds.has(id));
});
