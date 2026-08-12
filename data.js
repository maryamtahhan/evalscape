/* eslint-disable */
const LANDSCAPE = {
  categories: [
    {
      id: 'inference',
      name: 'Inference Benchmarking',
      description:
        'Tools for measuring LLM and model inference performance — throughput, latency, concurrency, and scalability across hardware.',
      color: '#2563EB',
      colorDark: '#3B82F6',
    },
    {
      id: 'embedding',
      name: 'Embedding Quality',
      description:
        'Benchmarks that evaluate embedding model quality across retrieval, classification, clustering, and semantic similarity tasks.',
      color: '#7C3AED',
      colorDark: '#A78BFA',
    },
    {
      id: 'audio',
      name: 'Audio & Speech',
      description:
        'Tools for benchmarking speech-to-text, audio transcription accuracy, and real-time audio model throughput.',
      color: '#059669',
      colorDark: '#34D399',
    },
    {
      id: 'security',
      name: 'Security & Vulnerability',
      description:
        'Benchmarks focused on security evaluation, vulnerability localization, and red-teaming of AI systems.',
      color: '#DC2626',
      colorDark: '#F87171',
    },
  ],

  tools: [
    // ── Inference ──────────────────────────────────────────────────────────
    {
      id: 'vllm-serve',
      name: 'vLLM Benchmark Serve',
      shortName: 'vLLM Serve',
      initials: 'vS',
      description:
        'Online serving benchmark that measures TTFT, TPOT, inter-token latency, and request/token throughput under concurrent load against a running vLLM server.',
      category: 'inference',
      hardware: ['cpu', 'gpu'],
      types: ['online'],
      url: 'https://github.com/vllm-project/vllm/blob/main/benchmarks/benchmark_serving.py',
      license: 'Apache 2.0',
      org: 'vLLM Project',
      metrics: [
        'TTFT – Time To First Token',
        'TPOT – Time Per Output Token',
        'ITL – Inter-token Latency',
        'Request throughput (req/s)',
        'Output token throughput (tok/s)',
      ],
      tags: ['vllm', 'online', 'serving', 'latency'],
    },
    {
      id: 'vllm-throughput',
      name: 'vLLM Benchmark Throughput',
      shortName: 'vLLM Throughput',
      initials: 'vT',
      description:
        'Offline static throughput benchmark measuring maximum tokens-per-second in batch processing mode, without request-level latency constraints.',
      category: 'inference',
      hardware: ['cpu', 'gpu'],
      types: ['offline'],
      url: 'https://github.com/vllm-project/vllm/blob/main/benchmarks/benchmark_throughput.py',
      license: 'Apache 2.0',
      org: 'vLLM Project',
      metrics: [
        'Total throughput (tok/s)',
        'Prompt throughput (tok/s)',
        'Generation throughput (tok/s)',
      ],
      tags: ['vllm', 'offline', 'batch', 'throughput'],
    },
    {
      id: 'mlperf',
      name: 'MLPerf Inference',
      shortName: 'MLPerf',
      initials: 'ML',
      description:
        'Industry-standard ML inference benchmark suite from MLCommons covering image classification, object detection, NLP, LLM, and recommendation tasks with offline and server (online) scenarios.',
      category: 'inference',
      hardware: ['cpu', 'gpu'],
      types: ['online', 'offline'],
      url: 'https://mlcommons.org/benchmarks/inference/',
      license: 'Apache 2.0',
      org: 'MLCommons',
      metrics: [
        'Samples / second',
        '90th-percentile latency',
        'Queries per second (QPS)',
      ],
      tags: ['mlcommons', 'industry-standard', 'llm', 'vision'],
    },
    {
      id: 'guidellm',
      name: 'GuideLLM',
      shortName: 'GuideLLM',
      initials: 'GL',
      description:
        'LLM serving evaluation framework from Neural Magic / Red Hat that sweeps concurrency rates and measures performance under sustained load, producing detailed latency-throughput profiles.',
      category: 'inference',
      hardware: ['cpu', 'gpu'],
      types: ['online'],
      url: 'https://github.com/neuralmagic/guidellm',
      license: 'Apache 2.0',
      org: 'Neural Magic / Red Hat',
      metrics: [
        'Request throughput (req/s)',
        'TTFT',
        'ITL',
        'Token throughput (tok/s)',
      ],
      tags: ['guidellm', 'serving', 'concurrency', 'red-hat'],
    },
    {
      id: 'inferx',
      name: 'InferX',
      shortName: 'InferX',
      initials: 'IX',
      description:
        'Inference benchmarking framework for comprehensive LLM performance characterization across different hardware configurations, serving stacks, and model sizes.',
      category: 'inference',
      hardware: ['cpu', 'gpu'],
      types: ['online', 'offline'],
      url: '#',
      license: '',
      org: '',
      metrics: [
        'Throughput (tok/s)',
        'Latency (p50 / p95 / p99)',
        'Memory utilization',
      ],
      tags: ['inferx', 'benchmarking'],
    },

    // ── Embedding ──────────────────────────────────────────────────────────
    {
      id: 'mteb',
      name: 'MTEB',
      shortName: 'MTEB',
      initials: 'MT',
      description:
        'Massive Text Embedding Benchmark — evaluates embedding models across 8 task types (retrieval, classification, clustering, STS, summarization, …) and 100+ datasets in 112 languages.',
      category: 'embedding',
      hardware: ['cpu', 'gpu'],
      types: ['embedding'],
      url: 'https://github.com/embeddings-benchmark/mteb',
      license: 'Apache 2.0',
      org: 'Hugging Face / MTEB',
      metrics: [
        'NDCG@10 (retrieval)',
        'MAP',
        'Accuracy (classification)',
        'Spearman correlation (STS)',
      ],
      tags: ['mteb', 'embedding', 'retrieval', 'huggingface'],
    },

    // ── Audio ──────────────────────────────────────────────────────────────
    {
      id: 'whisper-bench',
      name: 'Whisper Benchmarking',
      shortName: 'Whisper',
      initials: 'WH',
      description:
        'Evaluation of OpenAI Whisper and Faster-Whisper models for speech-to-text accuracy (WER/CER) and real-time transcription throughput on diverse audio datasets.',
      category: 'audio',
      hardware: ['cpu', 'gpu'],
      types: ['audio'],
      url: 'https://github.com/openai/whisper',
      license: 'MIT',
      org: 'OpenAI',
      metrics: [
        'WER – Word Error Rate',
        'CER – Character Error Rate',
        'Real-time factor (RTF)',
        'Tokens / second',
      ],
      tags: ['whisper', 'asr', 'transcription', 'openai'],
    },

    // ── Security ───────────────────────────────────────────────────────────
    {
      id: 'vloc-bench',
      name: 'VLoc Bench',
      shortName: 'VLoc Bench',
      initials: 'VL',
      description:
        'Vulnerability Localization Benchmark from Cisco that evaluates LLM ability to detect and precisely localize security vulnerabilities in source code across multiple languages and CWE categories.',
      category: 'security',
      hardware: ['cpu', 'gpu'],
      types: ['security'],
      url: '#',
      license: '',
      org: 'Cisco',
      metrics: [
        'Localization accuracy',
        'F1 score',
        'Precision / Recall',
        'CWE coverage',
      ],
      tags: ['vloc', 'security', 'vulnerability', 'cisco'],
    },
  ],
};
