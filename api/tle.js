// Vercel Serverless Function — 실시간 우주물체 TLE 제공
// CelesTrak에서 서버측으로 최신 데이터를 받아(브라우저 CORS 회피) 게임용 JSON으로 변환.
// Vercel CDN 캐시 6h + stale-while-revalidate → 항상 최신에 가깝고 기관 부하 최소.

const GROUPS = [
  { g: 'stations',          t: 'station', n: 6 },
  { g: 'fengyun-1c-debris', t: 'debris',  n: 85 },
  { g: 'cosmos-2251-debris',t: 'debris',  n: 60 },
  { g: 'iridium-33-debris', t: 'debris',  n: 40 },
  { g: 'starlink',          t: 'sat',     n: 70 },
];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseTLE(txt, t) {
  const lines = txt.split(/\r?\n/).map(s => s.replace(/\s+$/, '')).filter(s => s.length);
  const objs = [];
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const n = lines[i].trim(), l1 = lines[i + 1], l2 = lines[i + 2];
    if (l1 && l1.startsWith('1 ') && l2 && l2.startsWith('2 ')) objs.push({ n, t, l1, l2 });
  }
  return objs;
}

export default async function handler(req, res) {
  try {
    const out = [];
    for (const { g, t, n } of GROUPS) {
      try {
        const r = await fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${g}&FORMAT=tle`, {
          headers: { 'User-Agent': 'orbit-guardian/2.0 (portfolio demo)' },
        });
        if (!r.ok) continue;
        const objs = parseTLE(await r.text(), t);
        out.push(...shuffle(objs).slice(0, n));
      } catch (_) { /* skip this group, keep others */ }
    }
    if (out.length < 20) return res.status(502).json({ error: 'insufficient data' });
    shuffle(out);
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ error: 'fetch failed' });
  }
}
