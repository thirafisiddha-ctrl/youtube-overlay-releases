'use strict';
const fs = require('fs');

(async () => {
  const repo = process.env.REPO;
  const token = process.env.GH_TOKEN;
  const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'gh-actions',
      Accept: 'application/vnd.github+json'
    }
  });
  if (!res.ok) throw new Error('GitHub releases API ' + res.status);
  const rels = await res.json();
  let total = 0;
  let latestTag = 'v1.1.14';
  if (Array.isArray(rels) && rels.length > 0) {
    latestTag = rels[0].tag_name || latestTag;
    for (const r of rels) {
      for (const a of (r.assets || [])) total += Number(a.download_count || 0);
    }
  }
  const formatted = total >= 1000 ? total.toLocaleString('en-US') : String(total);
  const label = `${formatted} Downloads`;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 596 28" width="596" height="28" role="img" aria-label="${latestTag} • ${label} • Windows x64 • Zero OAuth • ID / EN / JA">`,
    '  <g font-family="Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif" font-size="11.5" font-weight="600">',
    '    <rect x="2" y="2" width="96" height="24" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>',
    '    <circle cx="17" cy="14" r="3.5" fill="#10b981"/>',
    `    <text x="56" y="18" text-anchor="middle" fill="#e2e8f0">${latestTag}</text>`,
    '    <rect x="106" y="2" width="132" height="24" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>',
    '    <path d="M121 9.5v6m0 0l-2.5-2.5m2.5 2.5l2.5-2.5M118 18h6" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    `    <text x="179" y="18" text-anchor="middle" fill="#7dd3fc">${label}</text>`,
    '    <rect x="246" y="2" width="104" height="24" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>',
    '    <text x="298" y="18" text-anchor="middle" fill="#93c5fd">Windows x64</text>',
    '    <rect x="358" y="2" width="96" height="24" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>',
    '    <text x="406" y="18" text-anchor="middle" fill="#fcd34d">Zero OAuth</text>',
    '    <rect x="462" y="2" width="132" height="24" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>',
    '    <text x="528" y="18" text-anchor="middle" fill="#f9a8d4">ID • EN • 日本語</text>',
    '  </g>',
    '</svg>'
  ].join('\n') + '\n';
  fs.writeFileSync('assets/status-pills.svg', svg, 'utf8');
  console.log('Updated SVG ->', latestTag, label);
})();
