import { Investigation, SetupItem, AgentEvent, EvidenceRecord } from '../types';

export const sampleInvestigation: Investigation = {
  id: 'inv-2026-001',
  question: 'How does search work in this app?',
  target: {
    name: 'sample-app.js',
    type: 'js-bundle',
    path: '/targets/sample-app.js',
    hash: 'sha256:a3f8c2...e91d',
    size: 245760,
  },
  status: 'explaining',
  createdAt: '2026-01-15T10:30:00Z',
  updatedAt: '2026-01-15T10:47:23Z',
  authorizationConfirmed: true,
  tags: ['search', 'web-app', 'javascript'],
  agents: [
    { id: 'agent-orch', role: 'orchestrator', status: 'active', budget: { maxCalls: 50, callsUsed: 23, maxTime: 600, timeUsed: 340 }, toolAllowList: ['delegate', 'plan', 'reconcile'], lastAction: 'Delegating to Explainer agent' },
    { id: 'agent-triage', role: 'triage', status: 'done', budget: { maxCalls: 20, callsUsed: 8, maxTime: 120, timeUsed: 45 }, toolAllowList: ['file-stat', 'mime-detect', 'source-map-check'], lastAction: 'Classified target as JS bundle with source map' },
    { id: 'agent-webjs', role: 'web-js', status: 'done', budget: { maxCalls: 100, callsUsed: 67, maxTime: 300, timeUsed: 189 }, toolAllowList: ['ast-parse', 'string-search', 'call-graph', 'source-map-resolve', 'dependency-trace'], lastAction: 'Mapped search pipeline: input → debounce → API → render' },
    { id: 'agent-evidence', role: 'evidence-curator', status: 'active', budget: { maxCalls: 30, callsUsed: 12, maxTime: 120, timeUsed: 60 }, toolAllowList: ['record-evidence', 'link-evidence', 'hash-verify'], lastAction: 'Recording evidence E7' },
    { id: 'agent-explainer', role: 'explainer', status: 'active', budget: { maxCalls: 20, callsUsed: 5, maxTime: 180, timeUsed: 90 }, toolAllowList: ['synthesize', 'diagram-gen', 'confidence-calc'], lastAction: 'Generating final explanation' },
    { id: 'agent-recon', role: 'reconstruction', status: 'idle', budget: { maxCalls: 30, callsUsed: 0, maxTime: 240, timeUsed: 0 }, toolAllowList: ['code-gen', 'template-select'], lastAction: undefined },
    { id: 'agent-policy', role: 'policy-safety', status: 'done', budget: { maxCalls: 10, callsUsed: 4, maxTime: 60, timeUsed: 12 }, toolAllowList: ['risk-assess', 'authorize-check'], lastAction: 'All actions cleared: static read-only' },
  ],
  events: [
    { id: 'evt-1', timestamp: '2026-01-15T10:30:01Z', agent: 'triage', action: 'classify_target', detail: 'Target identified: JavaScript bundle (240KB) with source map available' },
    { id: 'evt-2', timestamp: '2026-01-15T10:30:15Z', agent: 'policy-safety', action: 'risk_assess', detail: 'Risk class: static-read. Auto-approved. No network or file writes needed.' },
    { id: 'evt-3', timestamp: '2026-01-15T10:30:20Z', agent: 'orchestrator', action: 'create_plan', detail: 'Plan: 1) Source map resolution 2) Search keyword identification 3) Call graph analysis 4) API endpoint discovery 5) Synthesis' },
    { id: 'evt-4', timestamp: '2026-01-15T10:31:00Z', agent: 'web-js', action: 'source_map_resolve', detail: 'Resolved 847 original source files from source map', evidenceIds: ['E1'] },
    { id: 'evt-5', timestamp: '2026-01-15T10:32:30Z', agent: 'web-js', action: 'string_search', detail: 'Found 23 occurrences of "search" in relevant modules', evidenceIds: ['E2'] },
    { id: 'evt-6', timestamp: '2026-01-15T10:34:00Z', agent: 'web-js', action: 'call_graph', detail: 'Traced search pipeline: SearchInput → useDebounce(300ms) → searchAPI() → SearchResults', evidenceIds: ['E3', 'E4'] },
    { id: 'evt-7', timestamp: '2026-01-15T10:36:00Z', agent: 'web-js', action: 'api_discovery', detail: 'API endpoint: GET /api/v2/search?q={query}&limit=20&offset=0', evidenceIds: ['E5'] },
    { id: 'evt-8', timestamp: '2026-01-15T10:38:00Z', agent: 'web-js', action: 'algorithm_analysis', detail: 'Client-side fuzzy matching with Fuse.js (threshold: 0.3, keys: title, description, tags)', evidenceIds: ['E6'] },
    { id: 'evt-9', timestamp: '2026-01-15T10:40:00Z', agent: 'evidence-curator', action: 'verify_evidence', detail: 'All 6 evidence records verified with source hashes', evidenceIds: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'] },
    { id: 'evt-10', timestamp: '2026-01-15T10:42:00Z', agent: 'explainer', action: 'synthesize', detail: 'Generating explanation with confidence: high (87%)', evidenceIds: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'] },
  ],
  evidence: [
    { id: 'E1', type: 'source-excerpt', source: 'src/components/SearchInput.tsx:14-28', tool: 'source-map-resolve', parameters: { file: 'SearchInput.tsx', lines: '14-28' }, timestamp: '2026-01-15T10:31:00Z', hash: 'sha256:b2c4d1...', caption: 'Search input component with onChange handler and debounce wrapper', excerpt: 'const [query, setQuery] = useState("");\nconst debouncedQuery = useDebounce(query, 300);\n\nuseEffect(() => {\n  if (debouncedQuery.length >= 2) {\n    searchAPI(debouncedQuery);\n  }\n}, [debouncedQuery]);', confidence: 'confirmed' },
    { id: 'E2', type: 'string-match', source: 'src/utils/search.ts:1-45', tool: 'string-search', parameters: { pattern: 'search', scope: 'resolved-sources' }, timestamp: '2026-01-15T10:32:30Z', hash: 'sha256:c3d5e2...', caption: 'Search utility module with API call and local fallback', excerpt: 'export async function searchAPI(query: string) {\n  const response = await fetch(`/api/v2/search?q=${encodeURIComponent(query)}&limit=20`);\n  if (!response.ok) return localSearch(query);\n  return response.json();\n}', confidence: 'confirmed' },
    { id: 'E3', type: 'call-graph', source: 'src/components/SearchResults.tsx', tool: 'call-graph', parameters: { entryPoint: 'SearchInput', depth: 3 }, timestamp: '2026-01-15T10:34:00Z', hash: 'sha256:d4e6f3...', caption: 'Call graph showing search pipeline flow', excerpt: 'SearchInput → useDebounce(300ms) → searchAPI() → renderResults()', confidence: 'confirmed' },
    { id: 'E4', type: 'source-excerpt', source: 'src/hooks/useDebounce.ts:1-12', tool: 'source-map-resolve', parameters: { file: 'useDebounce.ts' }, timestamp: '2026-01-15T10:34:30Z', hash: 'sha256:e5f7a4...', caption: 'Custom debounce hook with 300ms default delay', excerpt: 'export function useDebounce<T>(value: T, delay = 300): T {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}', confidence: 'confirmed' },
    { id: 'E5', type: 'source-excerpt', source: 'src/api/search.ts:8-22', tool: 'string-search', parameters: { pattern: '/api/v2/search' }, timestamp: '2026-01-15T10:36:00Z', hash: 'sha256:f6a8b5...', caption: 'API endpoint definition with query parameters', excerpt: 'const SEARCH_ENDPOINT = "/api/v2/search";\ninterface SearchParams { q: string; limit?: number; offset?: number; filters?: Record<string, string>; }\n\nexport async function fetchSearch(params: SearchParams) {\n  const url = new URL(SEARCH_ENDPOINT, API_BASE);\n  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));\n  return fetch(url).then(r => r.json());\n}', confidence: 'confirmed' },
    { id: 'E6', type: 'source-excerpt', source: 'src/utils/localSearch.ts:1-30', tool: 'string-search', parameters: { pattern: 'Fuse' }, timestamp: '2026-01-15T10:38:00Z', hash: 'sha256:a7b9c6...', caption: 'Local fuzzy search fallback using Fuse.js', excerpt: 'import Fuse from "fuse.js";\nconst fuse = new Fuse(items, {\n  keys: ["title", "description", "tags"],\n  threshold: 0.3,\n  includeScore: true,\n});\nexport function localSearch(query: string) {\n  return fuse.search(query).map(r => r.item);\n}', confidence: 'high' },
  ],
  answer: {
    summary: 'The search feature uses a dual-path architecture: user input is debounced (300ms), then sent to a server API endpoint (GET /api/v2/search). If the API fails, it falls back to client-side fuzzy matching using Fuse.js with a 0.3 threshold across title, description, and tags fields. Results are rendered in a reactive component that updates as the debounced query changes.',
    flow: `graph TD
    A[User types in SearchInput] --> B{Length >= 2?}
    B -->|No| C[No action]
    B -->|Yes| D[useDebounce 300ms]
    D --> E[searchAPI called]
    E --> F{API success?}
    F -->|Yes| G[Parse JSON response]
    F -->|No| H[localSearch fallback]
    H --> I[Fuse.js fuzzy match]
    G --> J[SearchResults render]
    I --> J`,
    steps: [
      'User types in the search input field (SearchInput component)',
      'Input is captured in local state and passed through useDebounce hook (300ms delay)',
      'Once debounced value stabilizes and length >= 2, searchAPI() is called',
      'API call: GET /api/v2/search?q={query}&limit=20&offset=0',
      'On success: response JSON is parsed and passed to SearchResults',
      'On failure: localSearch() uses Fuse.js for client-side fuzzy matching',
      'Fuse.js searches across title, description, and tags with threshold 0.3',
      'Results are rendered reactively in the SearchResults component',
    ],
    evidenceRefs: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'],
    confidence: 'high',
    openQuestions: [
      'Server-side search algorithm not analyzed (would need backend access)',
      'Rate limiting behavior not observed (no runtime data)',
      'Search analytics/tracking not investigated',
    ],
    behaviorSpec: '## Search Behavior Specification\n\n### Inputs\n- Text query (minimum 2 characters)\n- Optional filters (category, date range)\n\n### Processing\n1. Debounce: 300ms delay after last keystroke\n2. Primary: Server API with pagination (limit=20, offset=0)\n3. Fallback: Client-side Fuse.js fuzzy search\n4. Matching keys: title, description, tags\n5. Fuzzy threshold: 0.3 (lower = stricter)\n\n### Outputs\n- Ranked list of matching items\n- Each result includes: title, description, tags, score\n- Pagination support via offset parameter\n\n### Edge Cases\n- Empty query: no search triggered\n- Query < 2 chars: ignored\n- API timeout/failure: silent fallback to local search\n- No results: empty state displayed',
    reconstruction: '## Recreate This Feature\n\n### React + TypeScript Implementation\n\n```typescript\n// 1. Debounce hook\nfunction useDebounce<T>(value: T, delay = 300): T {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}\n\n// 2. Search component\nfunction SearchBar() {\n  const [query, setQuery] = useState("");\n  const [results, setResults] = useState([]);\n  const debouncedQuery = useDebounce(query, 300);\n\n  useEffect(() => {\n    if (debouncedQuery.length < 2) return;\n    \n    fetch(`/api/search?q=${debouncedQuery}&limit=20`)\n      .then(r => r.ok ? r.json() : localFallback(debouncedQuery))\n      .then(setResults)\n      .catch(() => localFallback(debouncedQuery).then(setResults));\n  }, [debouncedQuery]);\n\n  return (\n    <div>\n      <input value={query} onChange={e => setQuery(e.target.value)} />\n      <ResultsList items={results} />\n    </div>\n  );\n}\n```\n\n### Key Design Decisions\n- **Debounce (300ms)**: Balances responsiveness vs. API load\n- **Dual-path**: Server-first with local fallback ensures offline capability\n- **Fuse.js**: Lightweight fuzzy matching without a server round-trip\n- **Min 2 chars**: Prevents overly broad searches\n\n### Dependencies\n- React 18+\n- fuse.js (^7.0.0)\n- Any backend with a search endpoint',
    reproduceCommands: [
      '# Analyze the search feature\nrea-agent investigate --target ./sample-app.js --question "How does search work?"',
      '# View evidence\nrea-agent evidence --investigation inv-2026-001',
      '# Export report\nrea-agent report --investigation inv-2026-001 --format md',
      '# Resume investigation\nrea-agent investigate --resume inv-2026-001',
    ],
  },
};

export const setupItems: SetupItem[] = [
  { name: 'Node.js', status: 'present', version: '20.11.0', required: true, description: 'JavaScript runtime for agent execution' },
  { name: 'REA Agents', status: 'present', version: '1.4.2', required: true, description: 'Core reverse engineering agent library (upstream)' },
  { name: 'Source Map Support', status: 'present', version: '0.5.0', required: false, description: 'Source map resolution for JS bundles' },
  { name: 'Ghidra', status: 'missing', required: false, description: 'Native binary analysis (optional, 500MB)', installCommand: 'rea-agent setup --install ghidra', size: '~500MB' },
  { name: 'JDK 17+', status: 'missing', required: false, description: 'Required by Ghidra (optional)', installCommand: 'rea-agent setup --install jdk', size: '~180MB' },
  { name: 'Python 3.10+', status: 'present', version: '3.11.5', required: false, description: 'Required for some analysis plugins' },
  { name: 'SQLite', status: 'present', version: '3.44.0', required: true, description: 'History and FTS5 search index' },
  { name: 'Playwright', status: 'optional', version: '1.41.0', required: false, description: 'Browser automation for runtime observation', installCommand: 'rea-agent setup --install playwright', size: '~200MB' },
];

export const historyItems = [
  { id: 'inv-2026-001', question: 'How does search work in this app?', target: 'sample-app.js', status: 'explaining' as const, date: '2026-01-15', tags: ['search', 'web-app'] },
  { id: 'inv-2026-002', question: 'What authentication mechanism is used?', target: 'auth-service.exe', status: 'archived' as const, date: '2026-01-14', tags: ['auth', 'native'] },
  { id: 'inv-2026-003', question: 'How are user preferences stored?', target: 'desktop-app.electron', status: 'archived' as const, date: '2026-01-12', tags: ['storage', 'electron'] },
  { id: 'inv-2026-004', question: 'What API endpoints does this bundle call?', target: 'dashboard.js', status: 'paused' as const, date: '2026-01-10', tags: ['network', 'api'] },
  { id: 'inv-2026-005', question: 'How is data encrypted at rest?', target: 'vault.bin', status: 'archived' as const, date: '2026-01-08', tags: ['crypto', 'native'] },
];

export const logEntries = [
  { timestamp: '10:47:23', level: 'info', agent: 'explainer', message: 'Synthesis complete. Confidence: 87% (high)' },
  { timestamp: '10:46:50', level: 'info', agent: 'evidence-curator', message: 'Evidence E6 verified: hash match confirmed' },
  { timestamp: '10:45:12', level: 'info', agent: 'web-js', message: 'Fuse.js configuration extracted from localSearch.ts' },
  { timestamp: '10:44:00', level: 'info', agent: 'orchestrator', message: 'All investigation agents complete. Handing off to Explainer.' },
  { timestamp: '10:42:00', level: 'info', agent: 'explainer', message: 'Beginning synthesis phase with 6 evidence records' },
  { timestamp: '10:40:00', level: 'info', agent: 'evidence-curator', message: 'Cross-referencing evidence chain: E1→E3→E5 verified' },
  { timestamp: '10:38:00', level: 'info', agent: 'web-js', message: 'Local search fallback identified: Fuse.js with threshold 0.3' },
  { timestamp: '10:36:00', level: 'info', agent: 'web-js', message: 'API endpoint discovered: GET /api/v2/search' },
  { timestamp: '10:34:00', level: 'info', agent: 'web-js', message: 'Call graph traced: SearchInput → useDebounce → searchAPI → SearchResults' },
  { timestamp: '10:32:30', level: 'info', agent: 'web-js', message: 'String search found 23 occurrences of "search" in resolved sources' },
  { timestamp: '10:31:00', level: 'info', agent: 'web-js', message: 'Source map resolved: 847 original files' },
  { timestamp: '10:30:20', level: 'info', agent: 'orchestrator', message: 'Plan created: 5 phases, estimated 12 minutes' },
  { timestamp: '10:30:15', level: 'info', agent: 'policy-safety', message: 'Risk assessment: static-read (auto-approved)' },
  { timestamp: '10:30:01', level: 'info', agent: 'triage', message: 'Target classified: JS bundle (240KB) with source map' },
  { timestamp: '10:30:00', level: 'info', agent: 'orchestrator', message: 'Investigation started: "How does search work in this app?"' },
];
