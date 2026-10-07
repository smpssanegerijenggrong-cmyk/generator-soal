import { generateText } from 'ai';

export const maxDuration = 300;

const MODEL_MAP = {
  auto: 'openai/gpt-5.6-sol',
  openai: 'openai/gpt-5.6-sol',
  claude: 'anthropic/claude-opus-5.5',
  gemini: 'google/gemini-3.1-pro-preview',
};
const FALLBACKS = [
  'openai/gpt-5.6-sol',
  'anthropic/claude-opus-5.5',
  'google/gemini-3.1-pro-preview',
];

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-sanjara-key');
  res.setHeader('Cache-Control', 'no-store');
}

function validateAccess(req) {
  const expected = process.env.SANJARA_ACCESS_CODE;
  if (!expected) return true;
  return req.headers['x-sanjara-key'] === expected;
}

function safeJson(text) {
  if (!text) throw new Error('Model tidak mengembalikan isi.');
  let cleaned = String(text).trim();
  cleaned = cleaned.replace(/^\`\`\`(?:json)?\s*/i, '').replace(/\s*\`\`\`$/i, '');
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first >= 0 && last > first) cleaned = cleaned.slice(first, last + 1);
  try { return JSON.parse(cleaned); }
  catch (error) { throw new Error(`Output model bukan JSON valid: ${error.message}`); }
}

async function callModel(model, messages) {
  const system = messages.find(m => m.role === 'system')?.content || '';
  const prompt = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n\n');
  try {
    const result = await generateText({
      model,
      system,
      prompt,
    });
    return { json: safeJson(result.text), model, usage: result.usage || null };
  } catch (error) {
    const err = new Error(`${model}: ${error?.message || 'AI Gateway request failed'}`);
    err.status = error?.statusCode || error?.status || error?.response?.status;
    throw err;
  }
}

async function callWithFallback(preferred, messages) {
  const models = [preferred, ...FALLBACKS.filter(model => model !== preferred)];
  const errors = [];
  for (const model of models) {
    try { return await callModel(model, messages); }
    catch (error) {
      errors.push(error.message);
      if ([401, 402, 403].includes(error.status)) break;
    }
  }
  throw new Error(errors.join(' | ') || 'Semua model AI gagal dihubungi.');
}

function buildSystemPrompt() {
  return `Anda adalah penyusun asesmen SMP Indonesia kelas profesional. Tugas Anda membuat soal bermutu tinggi, valid, tidak ambigu, sesuai CP/TP, materi, kelas, jenis ujian, dan level kognitif yang diberikan.

ATURAN MUTU WAJIB:
1. Gunakan Bahasa Indonesia baku, jelas, sesuai usia SMP. Untuk Bahasa Inggris, butir utama boleh berbahasa Inggris sesuai kebutuhan mapel.
2. Setiap butir harus sesuai persis dengan materi dan TP pada rencana nomor tersebut.
3. Stimulus harus relevan, realistis, cukup informasi, dan tidak membocorkan jawaban.
4. Hindari soal hafalan dangkal jika level meminta penerapan/penalaran/HOTS.
5. Distraktor PG harus homogen, masuk akal, tidak terlalu mudah ditebak, dan hanya ada satu jawaban terbaik untuk PG tunggal.
6. PGK-MCMA harus memiliki minimal dua jawaban benar. PGK-Kategori menggunakan pernyataan yang dinilai benar/salah; answers berisi indeks pernyataan yang BENAR.
7. Isian dan uraian harus memiliki answerText yang dapat dinilai. Uraian harus memiliki pembahasan/kriteria yang ringkas dan tepat.
8. Jangan membuat fakta atau angka yang mustahil. Jika memakai data buatan, tandai secara wajar sebagai konteks soal.
9. Jangan menulis komentar di luar JSON. Keluaran HARUS JSON valid saja.
10. Jangan gunakan markdown fence.

FORMAT JSON PERSIS:
{
  "questions": [
    {
      "no": 1,
      "stimulus": "...",
      "question": "...",
      "options": ["...","...","...","..."],
      "answers": [0],
      "answerText": "...",
      "explanation": "...",
      "comp": "kompetensi singkat",
      "indikator": "indikator soal terukur",
      "poin": 1
    }
  ],
  "qualityNotes": ["catatan singkat bila perlu"]
}
Untuk Isian/Uraian, options=[] dan answers=[].`;
}

function buildUserPrompt(body) {
  const { meta = {}, plan = [], contexts = [] } = body;
  const optionCount = Number(meta.optionCount || 4);
  return `Susun SATU paket ujian dengan spesifikasi berikut.

IDENTITAS:
- Sekolah: SMP SSA Negeri Jenggrong Ranuyoso
- Jenis ujian: ${meta.examTypeLabel || meta.examType || '-'}
- Mata pelajaran: ${meta.subjectName || '-'}
- Kelas: ${meta.grade || '-'} / Fase D
- Semester: ${meta.semester || '-'}
- Tipe soal: ${meta.questionMode || 'umum'}
- Sistem level: ${meta.taxonomy || 'tka'}
- Tingkat kesulitan: ${meta.difficulty || 'balanced'}
- Jumlah opsi PG: ${optionCount}
- Konteks yang disukai: ${contexts.join(', ') || 'sekolah dan kehidupan sehari-hari'}

RENCANA NOMOR SOAL (WAJIB DIIKUTI TANPA MENGUBAH URUTAN/JUMLAH):
${JSON.stringify(plan, null, 2)}

CP/TP lengkap dari guru:
${Array.isArray(meta.tps) ? meta.tps.map((x,i)=>`${i+1}. ${x}`).join('\n') : '-'}

Ketentuan bentuk soal:
- PG: options harus tepat ${optionCount} item; answers tepat 1 indeks berbasis nol.
- PGK-MCMA: options harus tepat ${optionCount} item; answers minimal 2 indeks berbasis nol.
- PGK-Kategori: options harus tepat ${optionCount} pernyataan; answers berisi indeks pernyataan yang benar.
- Isian: options=[], answers=[], answerText wajib jelas.
- Uraian: options=[], answers=[], answerText dan explanation wajib memuat jawaban/kriteria inti.
- no harus sama dengan no pada rencana.

Kembalikan ${plan.length} butir persis. JSON saja.`;
}

function buildReviewPrompt(body, generated) {
  return `Audit dan perbaiki paket soal berikut sebagai reviewer asesmen senior. Jangan mengubah jumlah, nomor, materi, TP, level, atau format yang diminta pada plan. Perbaiki bila ada: soal ambigu, stimulus lemah, distraktor tidak homogen, kunci salah, jawaban ganda pada PG tunggal, indikator tidak terukur, ketidaksesuaian level kognitif, bahasa kurang baku, atau pembahasan tidak menjelaskan alasan jawaban.

SPESIFIKASI ASLI:
${JSON.stringify({ meta: body.meta, plan: body.plan }, null, 2)}

PAKET HASIL GENERATE:
${JSON.stringify(generated, null, 2)}

Keluarkan JSON persis dengan struktur:
{"questions":[...],"qualityNotes":["ringkasan perbaikan reviewer"]}
JSON saja, tanpa markdown.`;
}

function validateGenerated(data, plan) {
  if (!data || !Array.isArray(data.questions)) throw new Error('AI tidak mengembalikan array questions.');
  if (data.questions.length !== plan.length) throw new Error(`AI menghasilkan ${data.questions.length} soal, seharusnya ${plan.length}.`);
  return data;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  if (!validateAccess(req)) return res.status(401).json({ ok: false, error: 'Kode akses sekolah tidak valid.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const plan = Array.isArray(body.plan) ? body.plan : [];
    if (!plan.length || plan.length > 50) return res.status(400).json({ ok: false, error: 'Rencana soal harus berisi 1–50 butir.' });

    const preferred = MODEL_MAP[body.model] || MODEL_MAP.auto;
    const messages = [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt(body) },
    ];

    const generated = await callWithFallback(preferred, messages);
    let result = validateGenerated(generated.json, plan);
    let reviewModel = '';
    let qualityNotes = Array.isArray(result.qualityNotes) ? result.qualityNotes : [];

    if (body.quality === 'max') {
      const reviewerPreferred = generated.model === 'anthropic/claude-opus-5.5'
        ? 'openai/gpt-5.6-sol'
        : 'anthropic/claude-opus-5.5';
      const reviewed = await callWithFallback(reviewerPreferred, [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildReviewPrompt(body, result.questions) },
      ]);
      result = validateGenerated(reviewed.json, plan);
      reviewModel = reviewed.model;
      qualityNotes = Array.isArray(result.qualityNotes) ? result.qualityNotes : qualityNotes;
    }

    return res.status(200).json({
      ok: true,
      questions: result.questions,
      model: generated.model,
      reviewModel,
      qualityNotes,
    });
  } catch (error) {
    console.error('SANJARA AI generate error:', error);
    const message = error.message || 'Generate AI gagal.';
    const low = String(message).toLowerCase();
    let status = error.status && Number.isInteger(error.status) ? error.status : 500;
    let code = 'AI_GENERATION_FAILED';
    let actionUrl = '';
    if (low.includes('credit card') || low.includes('customer_verification_required') || low.includes('insufficient_funds') || low.includes('quota')) {
      status = 402;
      code = 'AI_BILLING_REQUIRED';
      const match = message.match(/https:\/\/[^\s]+/);
      actionUrl = match ? match[0].replace(/[.,;]+$/,'') : '';
    } else if (status === 401 || status === 403) {
      code = 'AI_AUTH_REQUIRED';
    } else if (status === 429 || low.includes('rate limit')) {
      code = 'AI_RATE_LIMITED';
    }
    return res.status(status).json({ ok: false, code, error: message, actionUrl });
  }
}
