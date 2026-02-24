import React, { useState, useEffect } from 'react';

const BASE = process.env.REACT_APP_API_URL || 'https://api.useful-tools.com';

/* ─── Navigation structure ─────────────────────────────────────────────── */
const NAV = [
  { group: 'Getting Started', items: [
    { id: 'introduction',    label: 'Introduction' },
    { id: 'authentication',  label: 'Authentication' },
    { id: 'rate-limits',     label: 'Rate Limits' },
    { id: 'errors',          label: 'Errors' },
  ]},
  { group: 'Tools', items: [
    { id: 'tools-use',       label: 'POST  Use a tool' },
  ]},
  { group: 'Usage', items: [
    { id: 'usage-stats',     label: 'GET  Statistics' },
    { id: 'usage-quota',     label: 'GET  Quota' },
  ]},
  { group: 'Video (Pro+)', items: [
    { id: 'video-quota',     label: 'GET  Quota' },
    { id: 'video-generate',  label: 'POST  Generate' },
    { id: 'video-status',    label: 'GET  Status' },
  ]},
];

/* ─── Tiny UI primitives ────────────────────────────────────────────────── */
const badge = { GET: 'bg-emerald-100 text-emerald-800', POST: 'bg-blue-100 text-blue-800', DELETE: 'bg-red-100 text-red-800' };

const Method = ({ m }) => (
  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${badge[m]}`}>{m}</span>
);

const Endpoint = ({ method, path }) => (
  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 my-4">
    <Method m={method} />
    <code className="text-sm text-gray-800">{BASE}{path}</code>
  </div>
);

const ParamRow = ({ name, type, required, desc }) => (
  <tr className="border-b border-gray-100">
    <td className="py-2 pr-4 font-mono text-sm text-violet-700">{name}{required && <span className="text-red-500 ml-0.5">*</span>}</td>
    <td className="py-2 pr-4 text-sm text-gray-500 whitespace-nowrap">{type}</td>
    <td className="py-2 text-sm text-gray-700">{desc}</td>
  </tr>
);

const ParamTable = ({ params }) => (
  <table className="w-full border-collapse my-4">
    <thead>
      <tr className="border-b-2 border-gray-200 text-left">
        <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-400 w-1/4">Parameter</th>
        <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-400 w-1/5">Type</th>
        <th className="pb-2      text-xs font-semibold uppercase tracking-wider text-gray-400">Description</th>
      </tr>
    </thead>
    <tbody>{params.map(p => <ParamRow key={p.name} {...p} />)}</tbody>
  </table>
);

/* ─── Code block with language tabs ────────────────────────────────────── */
const CodeBlock = ({ blocks }) => {
  const [lang, setLang] = useState(blocks[0].lang);
  const [copied, setCopied] = useState(false);
  const current = blocks.find(b => b.lang === lang) || blocks[0];

  const copy = () => {
    navigator.clipboard.writeText(current.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 my-5 shadow-sm">
      <div className="flex items-center gap-1 bg-gray-800 px-3 border-b border-gray-700">
        {blocks.map(b => (
          <button key={b.lang} onClick={() => setLang(b.lang)}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${lang === b.lang ? 'border-blue-400 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
            {b.lang}
          </button>
        ))}
        <button onClick={copy} className="ml-auto text-xs px-3 py-2 text-gray-400 hover:text-white transition-colors">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="bg-gray-950 p-5 overflow-x-auto text-sm leading-relaxed">
        <code className="text-gray-300 whitespace-pre">{current.code}</code>
      </pre>
    </div>
  );
};

/* ─── JSON response box ─────────────────────────────────────────────────── */
const JsonResponse = ({ data }) => (
  <div className="my-5">
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Response</p>
    <pre className="bg-gray-950 rounded-xl border border-gray-700 p-5 overflow-x-auto text-sm leading-relaxed shadow-sm">
      <code className="text-emerald-400 whitespace-pre">{JSON.stringify(data, null, 2)}</code>
    </pre>
  </div>
);

/* ─── Section wrapper ───────────────────────────────────────────────────── */
const Section = ({ id, title, children }) => (
  <section id={id} className="mb-20 scroll-mt-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200">{title}</h2>
    {children}
  </section>
);

const P = ({ children }) => <p className="text-gray-600 leading-relaxed mb-4">{children}</p>;
const H3 = ({ children }) => <h3 className="text-base font-semibold text-gray-800 mt-8 mb-3">{children}</h3>;



/* ─── Code snippets ──────────────────────────────────────────────────────── */
const K = 'ut_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

const SNIPPETS = {
  auth: [
    { lang: 'curl', code:
`curl ${BASE}/api/tools/qr-generator/use \\
  -X POST \\
  -H "Authorization: Bearer ${K}" \\
  -H "Content-Type: application/json" \\
  -d '{"category":"general"}'` },
    { lang: 'Node.js', code:
`const res = await fetch('${BASE}/api/tools/qr-generator/use', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ category: 'general' }),
});
const data = await res.json();` },
    { lang: 'Python', code:
`import requests

API_KEY = "ut_live_..."

response = requests.post(
    "${BASE}/api/tools/qr-generator/use",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={"category": "general"},
)
data = response.json()` },
  ],

  toolsUse: [
    { lang: 'curl', code:
`curl -X POST ${BASE}/api/tools/{toolName}/use \\
  -H "Authorization: Bearer ${K}" \\
  -H "Content-Type: application/json" \\
  -d '{"category":"general"}'` },
    { lang: 'Node.js', code:
`const res = await fetch(\`${BASE}/api/tools/\${toolName}/use\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ category: 'general' }),
});
const { success, message, quota } = await res.json();` },
    { lang: 'Python', code:
`r = requests.post(
    f"${BASE}/api/tools/{tool_name}/use",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={"category": "general"},
)
print(r.json())` },
  ],

  usageStats: [
    { lang: 'curl', code:
`curl "${BASE}/api/usage/stats?period=month" \\
  -H "Authorization: Bearer ${K}"` },
    { lang: 'Node.js', code:
`const res = await fetch(\`${BASE}/api/usage/stats?period=month\`, {
  headers: { 'Authorization': \`Bearer \${API_KEY}\` },
});
const { totalUsage, toolsUsage } = await res.json();` },
    { lang: 'Python', code:
`r = requests.get(
    "${BASE}/api/usage/stats",
    params={"period": "month"},
    headers={"Authorization": f"Bearer {API_KEY}"},
)
print(r.json())` },
  ],

  usageQuota: [
    { lang: 'curl', code:
`curl ${BASE}/api/usage/quota \\
  -H "Authorization: Bearer ${K}"` },
    { lang: 'Node.js', code:
`const res = await fetch('${BASE}/api/usage/quota', {
  headers: { 'Authorization': \`Bearer \${API_KEY}\` },
});
const { daily, monthly } = await res.json();` },
    { lang: 'Python', code:
`r = requests.get(
    "${BASE}/api/usage/quota",
    headers={"Authorization": f"Bearer {API_KEY}"},
)
print(r.json())` },
  ],

  videoQuota: [
    { lang: 'curl', code:
`curl ${BASE}/api/video/quota \\
  -H "Authorization: Bearer ${K}"` },
    { lang: 'Node.js', code:
`const res = await fetch('${BASE}/api/video/quota', {
  headers: { 'Authorization': \`Bearer \${API_KEY}\` },
});
const { plan, limit, used, remaining } = await res.json();` },
    { lang: 'Python', code:
`r = requests.get(
    "${BASE}/api/video/quota",
    headers={"Authorization": f"Bearer {API_KEY}"},
)
print(r.json())` },
  ],

  videoGenerate: [
    { lang: 'curl', code:
`curl -X POST ${BASE}/api/video/generate \\
  -H "Authorization: Bearer ${K}" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"A timelapse of a city skyline at sunset, cinematic 4K"}'` },
    { lang: 'Node.js', code:
`const res = await fetch('${BASE}/api/video/generate', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'A timelapse of a city skyline at sunset, cinematic 4K',
  }),
});
const { jobId } = await res.json();` },
    { lang: 'Python', code:
`r = requests.post(
    "${BASE}/api/video/generate",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={"prompt": "A timelapse of a city skyline at sunset, cinematic 4K"},
)
job_id = r.json()["jobId"]` },
  ],

  videoStatus: [
    { lang: 'curl', code:
`curl ${BASE}/api/video/status/{jobId} \\
  -H "Authorization: Bearer ${K}"` },
    { lang: 'Node.js', code:
`const res = await fetch(\`${BASE}/api/video/status/\${jobId}\`, {
  headers: { 'Authorization': \`Bearer \${API_KEY}\` },
});
const { status, video_url } = await res.json();` },
    { lang: 'Python', code:
`r = requests.get(
    f"${BASE}/api/video/status/{job_id}",
    headers={"Authorization": f"Bearer {API_KEY}"},
)
print(r.json()["video_url"])` },
  ],
};


/* ─── Main component ─────────────────────────────────────────────────────── */
const ApiDocsPage = () => {
  const [active, setActive] = useState('introduction');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-10% 0px -75% 0px' }
    );
    document.querySelectorAll('section[id]').forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="flex min-h-screen bg-white font-sans">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-64 shrink-0 border-r border-gray-200 sticky top-0 h-screen overflow-y-auto bg-gray-50">
        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">API Reference</p>
          {NAV.map(group => (
            <div key={group.group} className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{group.group}</p>
              <ul className="space-y-0.5">
                {group.items.map(item => (
                  <li key={item.id}>
                    <button onClick={() => scrollTo(item.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        active === item.id
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-10 py-14">

          {/* INTRODUCTION */}
          <Section id="introduction" title="Introduction">
            <P>The Useful Tools API gives Enterprise customers programmatic access to all tools,
               usage statistics, and AI video generation. Integrate it into your apps, workflows,
               or CI/CD pipelines.</P>
            <H3>Base URL</H3>
            <div className="bg-gray-900 rounded-xl px-5 py-3 font-mono text-sm text-emerald-400 select-all">
              {BASE}
            </div>
          </Section>

          {/* AUTHENTICATION */}
          <Section id="authentication" title="Authentication">
            <P>All API requests must include your API key in the{' '}
               <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">Authorization</code>{' '}
               header as a Bearer token. Generate keys from the <strong>Enterprise → API Keys</strong> dashboard.</P>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 my-4">
              ⚠️ Keep your API key secret. Never expose it in client-side code or commit it to version control.
              Revoke compromised keys immediately from your dashboard.
            </div>
            <CodeBlock blocks={SNIPPETS.auth} />
          </Section>

          {/* RATE LIMITS */}
          <Section id="rate-limits" title="Rate Limits">
            <P>The API enforces a global rate limit of <strong>100 requests per 15 minutes</strong> per
               IP address. When exceeded, the API returns a{' '}
               <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">429 Too Many Requests</code> response.</P>
            <ParamTable params={[
              { name: 'Window',  type: '15 min',  desc: 'Rolling time window for rate limiting' },
              { name: 'Limit',   type: '100 req', desc: 'Maximum requests per window per IP' },
              { name: 'Header',  type: 'string',  desc: 'Retry-After header returned when rate limited' },
            ]} />
          </Section>

          {/* ERRORS */}
          <Section id="errors" title="Errors">
            <P>The API uses standard HTTP status codes. Error responses include a JSON body with
               an <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">error</code> field.</P>
            <ParamTable params={[
              { name: '400', type: 'Bad Request',       desc: 'Missing or invalid parameters' },
              { name: '401', type: 'Unauthorized',      desc: 'Missing or invalid API key' },
              { name: '403', type: 'Forbidden',         desc: 'Enterprise plan required' },
              { name: '404', type: 'Not Found',         desc: 'Resource does not exist' },
              { name: '429', type: 'Too Many Requests', desc: 'Rate limit or quota exceeded' },
              { name: '500', type: 'Server Error',      desc: 'Internal server error' },
            ]} />
            <JsonResponse data={{ error: { message: 'Daily quota exceeded. Upgrade your plan to continue.' } }} />
          </Section>

          {/* TOOLS - USE */}
          <Section id="tools-use" title="Use a Tool">
            <P>Record a tool usage event. This endpoint checks your daily/monthly quota before
               logging the usage. Call it whenever a user triggers a tool in your integration.</P>
            <Endpoint method="POST" path="/api/tools/{toolName}/use" />
            <H3>Path parameters</H3>
            <ParamTable params={[
              { name: 'toolName', type: 'string', required: true, desc: 'Tool identifier (see list below).' },
            ]} />
            <H3>Body</H3>
            <ParamTable params={[
              { name: 'category', type: 'string', desc: 'Tool category — default: "general"' },
            ]} />
            <H3>Available tools</H3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 my-4 grid grid-cols-2 gap-x-8 gap-y-1 text-sm font-mono text-gray-700">
              {['qr-generator','json-csv','password-generator','base64','text-diff','minifier',
                'color-palette','color-converter','gradient-generator','box-shadow','favicon-generator',
                'pomodoro','freelance-calculator','invoice-generator','quote-generator','markdown-editor',
                'hash-generator','jwt-decoder','dca-calculator','impermanent-loss','video-generator']
                .map(t => <span key={t}>{t}</span>)}
            </div>
            <CodeBlock blocks={SNIPPETS.toolsUse} />
            <JsonResponse data={{ success: true, message: 'Usage recorded', quota: { daily: { used: 42, limit: -1 }, monthly: { used: 210, limit: -1 } } }} />
          </Section>

          {/* USAGE - STATS */}
          <Section id="usage-stats" title="Get Statistics">
            <P>Retrieve usage statistics for a given period. Returns a breakdown per tool and total usage count.</P>
            <Endpoint method="GET" path="/api/usage/stats" />
            <H3>Query parameters</H3>
            <ParamTable params={[
              { name: 'period', type: 'string', desc: 'Time period: day · week · month · year — default: month' },
            ]} />
            <CodeBlock blocks={SNIPPETS.usageStats} />
            <JsonResponse data={{ period: 'month', totalUsage: 210, toolsUsage: [{ tool_name: 'qr-generator', count: 80 }, { tool_name: 'base64', count: 130 }], subscription: { plan: 'enterprise', daily_limit: -1, monthly_limit: -1 } }} />
          </Section>

          {/* USAGE - QUOTA */}
          <Section id="usage-quota" title="Get Quota">
            <P>Check your current daily and monthly quota consumption in real time. Useful for building
               usage dashboards or throttling logic in your own app.</P>
            <Endpoint method="GET" path="/api/usage/quota" />
            <CodeBlock blocks={SNIPPETS.usageQuota} />
            <JsonResponse data={{ daily: { used: 42, limit: -1, remaining: -1 }, monthly: { used: 210, limit: -1, remaining: -1 } }} />
          </Section>

          {/* VIDEO - QUOTA */}
          <Section id="video-quota" title="Video — Get Quota">
            <P>Returns your current AI video generation quota. Enterprise users generate 1080p videos.
               Quota resets monthly. A limit of <code className="bg-gray-100 px-1 rounded font-mono text-sm">-1</code> means unlimited.</P>
            <Endpoint method="GET" path="/api/video/quota" />
            <CodeBlock blocks={SNIPPETS.videoQuota} />
            <JsonResponse data={{ plan: 'enterprise', limit: -1, used: 3, remaining: -1 }} />
          </Section>

          {/* VIDEO - GENERATE */}
          <Section id="video-generate" title="Video — Generate">
            <P>Submit a text prompt to generate a short AI video (MiniMax Hailuo 2.3). The response
               returns a <code className="bg-gray-100 px-1 rounded font-mono text-sm">jobId</code> — poll
               the status endpoint to get the final video URL.</P>
            <Endpoint method="POST" path="/api/video/generate" />
            <H3>Body</H3>
            <ParamTable params={[
              { name: 'prompt', type: 'string', required: true, desc: 'Video description (10–500 characters)' },
            ]} />
            <CodeBlock blocks={SNIPPETS.videoGenerate} />
            <JsonResponse data={{ success: true, jobId: 'job_a1b2c3d4e5f6' }} />
          </Section>

          {/* VIDEO - STATUS */}
          <Section id="video-status" title="Video — Get Status">
            <P>Poll the status of a video generation job. When{' '}
               <code className="bg-gray-100 px-1 rounded font-mono text-sm">status</code> is{' '}
               <code className="bg-gray-100 px-1 rounded font-mono text-sm">completed</code>, the{' '}
               <code className="bg-gray-100 px-1 rounded font-mono text-sm">video_url</code> field
               contains the download URL (valid for 24 h).</P>
            <Endpoint method="GET" path="/api/video/status/{jobId}" />
            <H3>Path parameters</H3>
            <ParamTable params={[
              { name: 'jobId', type: 'string', required: true, desc: 'Job ID returned by POST /api/video/generate' },
            ]} />
            <CodeBlock blocks={SNIPPETS.videoStatus} />
            <JsonResponse data={{ status: 'completed', video_url: 'https://cdn.fal.ai/video/abc123.mp4', prompt: 'A timelapse of a city skyline at sunset', error_message: null }} />
          </Section>

        </div>
      </main>
    </div>
  );
};

export default ApiDocsPage;
