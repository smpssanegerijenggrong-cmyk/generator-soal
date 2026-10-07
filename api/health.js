export const maxDuration = 30;

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-sanjara-key');
  res.setHeader('Cache-Control', 'no-store');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const onVercel = Boolean(process.env.VERCEL || process.env.VERCEL_URL);
  const explicitKey = Boolean(process.env.AI_GATEWAY_API_KEY);
  return res.status(200).json({
    ok: true,
    gatewayConfigured: onVercel || explicitKey,
    gatewayReachable: onVercel || explicitKey,
    inferenceVerified: false,
    authMode: explicitKey ? 'api-key' : (onVercel ? 'vercel-oidc-runtime' : 'none'),
    accessCodeRequired: Boolean(process.env.SANJARA_ACCESS_CODE),
    engine: 'Vercel AI Gateway + AI SDK 7',
    note: 'Health hanya memastikan backend dan autentikasi runtime tersedia; kemampuan inferensi diverifikasi saat Generate.',
    models: {
      openai: 'openai/gpt-5.6-sol',
      claude: 'anthropic/claude-opus-5.5',
      gemini: 'google/gemini-3.1-pro-preview'
    }
  });
}
