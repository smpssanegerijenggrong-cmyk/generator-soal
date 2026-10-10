import { timingSafeEqual } from 'node:crypto';
const DEFAULT_MODEL = 'gemini-2.5-flash';
const ALLOWED_MODELS = new Set(['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite']);
const MAX_BODY_BYTES = 450000;
const MAX_PROMPT_CHARS = 170000;
const REQUEST_TIMEOUT_MS = 48000;
function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(data));
}
function allowOrigin(req, res) {
  const origin = req.headers.origin;
  if (!origin) return true;
  let isSameOrigin = false;
  try { isSameOrigin = new URL(origin).host === req.headers.host; } catch {}
  if (isSameOrigin) return true;
  const allowed = process.env.ALLOWED_ORIGIN?.trim();
  if (allowed && origin === allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-SANJARA-ACCESS-CODE');
    return true;
  }
  return false;
}
function authorize(candidate, expected) {
  if (!candidate || !expected) return false;
  const a = Buffer.from(String(candidate));
  const b = Buffer.from(String(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}
async function parseRequest(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  if (typeof req.body === 'string') raw = req.body;
  else {
    for await (const chunk of req) {
      raw += chunk.toString('utf8');
      if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
        const err = new Error('Permintaan terlalu besar. Perkecil PDF atau materi.');
        err.status = 413; throw err;
      }
    }
  }
  try { return JSON.parse(raw); }
  catch { const err = new Error('Body permintaan harus berupa JSON valid.'); err.status = 400; throw err; }
}
function extractJson(candidate) {
  const finishReason = candidate?.finishReason || 'UNKNOWN';
  const output = (candidate?.content?.parts || []).map(p => p.text || '').join('').trim();
  if (!output) {
    const err = new Error('Gemini tidak mengembalikan konten (' + finishReason + '). Coba kurangi jumlah soal atau ubah materi.');
    err.status = 502; throw err;
  }
  const content = output.replace(/^\u0060{3}(?:json)?\s*/i, '').replace(/\u0060{3}\s*$/, '').trim();
  let json;
  try { json = JSON.parse(content); }
  catch {
    const err = new Error('AI menghasilkan JSON tidak lengkap. Coba ulang atau gunakan jumlah soal lebih sedikit. Finish reason: ' + finishReason);
    err.status = 502; throw err;
  }
  if (!json || typeof json !== 'object' || !Array.isArray(json.items)) {
    const err = new Error('Format JSON Gemini tidak berisi items soal. Silakan Generate ulang.');
    err.status = 502; throw err;
  }
  return json;
}
export default async function handler(req, res) {
  if (!allowOrigin(req, res)) return send(res, 403, { error: 'Domain asal tidak diizinkan. Gunakan URL Vercel yang sama atau atur ALLOWED_ORIGIN.' });
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return send(res, 405, { error: 'Gunakan metode POST untuk menghasilkan soal.' });
  }
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return send(res, 503, { error: 'GEMINI_API_KEY belum diatur di Vercel → Settings → Environment Variables.' });
  const secret = process.env.SANJARA_ACCESS_CODE;
  if (!secret && process.env.ALLOW_PUBLIC_GENERATION !== 'true') {
    return send(res, 503, { error: 'SANJARA_ACCESS_CODE belum diatur. Demi keamanan biaya API, wajib atur kode akses sekolah di Vercel.' });
  }
  if (secret && !authorize(req.headers['x-sanjara-access-code'], secret)) {
    return send(res, 401, { error: 'Kode akses sekolah salah atau belum diisi di Pengaturan AI.' });
  }
  if (!String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) {
    return send(res, 415, { error: 'Content-Type harus application/json.' });
  }
  try {
    const payload = await parseRequest(req);
    const prompt = typeof payload?.prompt === 'string' ? payload.prompt.trim() : '';
    if (prompt.length < 100 || prompt.length > MAX_PROMPT_CHARS) {
      return send(res, 400, { error: 'Prompt tidak valid. Panjang yang didukung 100–170.000 karakter.' });
    }
    const model = ALLOWED_MODELS.has(payload.model) ? payload.model : DEFAULT_MODEL;
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.25,
        responseMimeType: 'application/json',
        maxOutputTokens: 16384,
        ...(model === 'gemini-2.5-flash' || model === 'gemini-2.5-flash-lite' ? { thinkingConfig: { thinkingBudget: 0 } } : {})
      }
    };
    let response;
    let result;
    for (let attempt = 0; attempt < 2; attempt++) {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });
      const dataText = await response.text();
      try { result = JSON.parse(dataText); } catch { result = null; }
      if (response.ok) break;
      if (attempt === 0 && [429, 500, 502, 503].includes(response.status)) {
        await new Promise(resolve => setTimeout(resolve, 1100));
        continue;
      }
      const detail = String(result?.error?.message || 'Gemini API mengembalikan kesalahan.').slice(0, 350);
      const friendly = response.status === 429 ? 'Kuota Gemini habis atau permintaan terlalu sering. ' + detail
        : response.status === 400 ? 'Prompt ditolak Gemini: ' + detail
        : response.status === 401 || response.status === 403 ? 'API key Gemini tidak sah atau tidak memiliki izin. ' + detail
        : response.status === 404 ? 'Model Gemini tidak tersedia untuk API key ini. Coba gemini-2.5-flash. ' + detail
        : 'Gemini gagal (HTTP ' + response.status + '): ' + detail;
      return send(res, response.status === 429 ? 429 : 502, { error: friendly });
    }
    const parsed = extractJson(result?.candidates?.[0]);
    return send(res, 200, { result: parsed, model, usage: result?.usageMetadata?.totalTokenCount ?? null });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      return send(res, 504, { error: 'Gemini kehabisan waktu. Coba jumlah soal yang lebih sedikit.' });
    }
    return send(res, error.status || 500, { error: String(error.message || 'Terjadi gangguan API.').slice(0, 450) });
  }
}