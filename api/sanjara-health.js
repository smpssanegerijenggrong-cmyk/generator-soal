export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'GET only' }));
  }
  const keyConfigured = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  const accessConfigured = Boolean(process.env.SANJARA_ACCESS_CODE || process.env.ALLOW_PUBLIC_GENERATION === 'true');
  res.statusCode = 200;
  res.end(JSON.stringify({
    service: 'SANJARA AI',
    online: true,
    ready: keyConfigured && accessConfigured,
    keyConfigured,
    accessConfigured,
    model: 'gemini-2.5-flash'
  }));
}