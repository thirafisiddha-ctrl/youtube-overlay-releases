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
  let latestExeUrl = '';
  if (Array.isArray(rels) && rels.length > 0) {
    const latest = rels.find(r => !r.draft && !r.prerelease) || rels[0];
    latestTag = latest.tag_name || latestTag;
    const setupAsset = (latest.assets || []).find(a => /setup.*.exe$/i.test(a.name || ''));
    if (setupAsset && setupAsset.browser_download_url) {
      latestExeUrl = setupAsset.browser_download_url;
    }
    for (const r of rels) {
      for (const a of (r.assets || [])) total += Number(a.download_count || 0);
    }
  }
  const formatted = total >= 1000 ? total.toLocaleString('en-US') : String(total);
  const label = `${formatted} Downloads`;

  const pillsSvg = [
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
  fs.writeFileSync('assets/status-pills.svg', pillsSvg, 'utf8');

  const btnSvg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 68" width="420" height="68" role="img" aria-label="Download YouTube Overlay Studio ${latestTag} for Windows">`,
    '  <defs>',
    '    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">',
    '      <stop offset="0%" stop-color="#0f233d"/>',
    '      <stop offset="100%" stop-color="#091322"/>',
    '    </linearGradient>',
    '    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">',
    '      <stop offset="0%" stop-color="#38bdf8"/>',
    '      <stop offset="100%" stop-color="#0284c7"/>',
    '    </linearGradient>',
    '  </defs>',
    '  <rect x="1.5" y="1.5" width="417" height="65" rx="14" fill="url(#bgGrad)" stroke="#38bdf8" stroke-opacity="0.65" stroke-width="1.5"/>',
    '  <circle cx="38" cy="34" r="19" fill="url(#iconGrad)"/>',
    '  <path d="M38 24v13m0 0l-5-5m5 5l5-5M30 42h16" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    '  <text x="68" y="30" font-family="Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif" font-size="15.5" font-weight="700" fill="#f8fafc" letter-spacing="0.1">Download untuk Windows</text>',
    `  <text x="68" y="49" font-family="Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif" font-size="11.5" font-weight="500" fill="#94a3b8">${latestTag}  •  Installer x64  •  Auto-Update</text>`,
    '  <rect x="348" y="21" width="54" height="26" rx="8" fill="#38bdf8" fill-opacity="0.14" stroke="#38bdf8" stroke-opacity="0.45" stroke-width="1"/>',
    '  <text x="375" y="38" text-anchor="middle" font-family="Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif" font-size="11.5" font-weight="700" fill="#38bdf8">.EXE ↓</text>',
    '</svg>'
  ].join('\n') + '\n';
  fs.writeFileSync('assets/download-btn.svg', btnSvg, 'utf8');

  if (latestExeUrl && fs.existsSync('README.md')) {
    const readme = fs.readFileSync('README.md', 'utf8');
    const nextReadme = readme.replace(
      /https:\/\/github\.com\/[^"'\s]+\/releases\/download\/[^"'\s]+\/YouTube\.Overlay\.Setup\.[^"'\s]+\.exe/,
      latestExeUrl
    );
    if (nextReadme !== readme) {
      fs.writeFileSync('README.md', nextReadme, 'utf8');
    }
  }
  console.log('Updated stats ->', latestTag, label, latestExeUrl);
})();
