const AI_API_BASE='https://sanjara-tka-ai-premium.vercel.app';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const SUBJECTS = {
  official: [
    {id:'indo', name:'Bahasa Indonesia', topics:['Campuran Semua Materi','Pemahaman Teks Informasi','Teks Sastra','Inferensi & Evaluasi','Makna Kata & Informasi']},
    {id:'math', name:'Matematika (Umum)', topics:['Campuran Semua Materi','Bilangan','Aljabar','Geometri & Pengukuran','Data & Peluang']}
  ],
  school: [
    {id:'gsm', name:'Gerakan Sekolah Mengaji (GSM)', topics:['Campuran Semua Materi','Baca Al-Qur’an','Tajwid Dasar','Adab Mengaji','Pemahaman Nilai']},
    {id:'tahfidz', name:'Baca Tahfidz Tadabur Al quran', topics:['Campuran Semua Materi','Makharijul Huruf','Tajwid','Hafalan','Tadabur Al-Qur’an']},
    {id:'pai', name:'Pendidikan Agama Islam dan Budi Pekerti', topics:['Campuran Semua Materi','Al-Qur’an dan Hadis','Akidah','Akhlak','Fikih','Sejarah Peradaban Islam']},
    {id:'konghucu', name:'Pendidikan Agama Konghuchu dan Budi Pekerti', topics:['Campuran Semua Materi','Keimanan','Kitab Suci','Tata Ibadah','Etika dan Budi Pekerti']},
    {id:'kepercayaan', name:'Pendidikan Kepercayaan terhadap Tuhan YME dan Budi Pekerti', topics:['Campuran Semua Materi','Kepercayaan kepada Tuhan YME','Budi Pekerti','Toleransi','Nilai Luhur']},
    {id:'pancasila', name:'Pendidikan Pancasila', topics:['Campuran Semua Materi','Pancasila','Konstitusi','Keberagaman','Hak & Kewajiban']},
    {id:'project', name:'Pembelajaran Berbasis Projek', topics:['Campuran Semua Materi','Identifikasi Masalah','Perencanaan Projek','Kolaborasi','Produk & Presentasi','Refleksi']},
    {id:'indo', name:'Bahasa Indonesia', topics:['Campuran Semua Materi','Pemahaman Teks Informasi','Teks Sastra','Inferensi & Evaluasi','Makna Kata & Informasi']},
    {id:'english', name:'Bahasa Inggris', topics:['Campuran Semua Materi','Descriptive Text','Recount Text','Procedure Text','Functional Text','Grammar in Context']},
    {id:'local', name:'Muatan Lokal Bahasa Daerah', topics:['Campuran Semua Materi','Kosakata','Unggah-Ungguh Bahasa','Teks Bahasa Daerah','Sastra & Budaya Lokal']},
    {id:'math', name:'Matematika (Umum)', topics:['Campuran Semua Materi','Bilangan','Aljabar','Geometri & Pengukuran','Data & Peluang']},
    {id:'ipa', name:'Ilmu Pengetahuan Alam (IPA)', topics:['Campuran Semua Materi','Makhluk Hidup & Ekosistem','Zat & Perubahannya','Energi','Bumi & Lingkungan']},
    {id:'ips', name:'Ilmu Pengetahuan Sosial (IPS)', topics:['Campuran Semua Materi','Interaksi Sosial','Geografi','Ekonomi','Sejarah']},
    {id:'codingai', name:'Koding dan Kecerdasan Artifisial', topics:['Campuran Semua Materi','Berpikir Komputasional','Algoritma','Data & Kecerdasan Artifisial','Etika AI & Digital']},
    {id:'pjok', name:'Pendidikan Jasmani, Olahraga, dan Kesehatan', topics:['Campuran Semua Materi','Kebugaran Jasmani','Permainan & Olahraga','Kesehatan','Keselamatan Aktivitas Fisik']},
    {id:'bk', name:'Bimbingan dan Konseling/Konselor (BP/BK)', topics:['Campuran Semua Materi','Pemahaman Diri','Hubungan Sosial','Strategi Belajar','Perencanaan Karier']},
    {id:'senibudaya', name:'Seni, Budaya dan Prakarya', topics:['Campuran Semua Materi','Seni Rupa','Seni Musik','Seni Tari','Seni Teater','Prakarya']},
    {id:'prakarya', name:'Prakarya', topics:['Campuran Semua Materi','Kerajinan','Pengolahan','Budidaya','Rekayasa']},
    {id:'informatika', name:'Informatika', topics:['Campuran Semua Materi','Sistem Komputer','Jaringan & Internet','Analisis Data','Algoritma & Pemrograman','Dampak Sosial Informatika']}
  ]
};

let currentQuestions = [];
let showKeys = false;
let assessmentMeta = null;
const CURRICULUM_STORAGE_KEY = 'tkaCurriculumDraft';
function getCurriculumDraft(){
  try{return JSON.parse(localStorage.getItem(CURRICULUM_STORAGE_KEY)||'{}')}catch{return {}}
}
function getCurriculumKey(){return `${$('#mode').value}:${$('#subject').value}`}
function persistCurriculumDraft(){
  const draft=getCurriculumDraft();
  draft[getCurriculumKey()]={
    materialScope:$('#materialScope')?.value||'single',
    materials:getMaterialRows(),
    topic:$('#topic').value,
    customTopic:$('#customTopic').value,
    tp:$('#customTP').value,
    printTP:$('#printTP').checked,
    semester:$('#semester').value,
    examType:$('#examType').value,
    examTypeCustom:$('#examTypeCustom').value,
    questionMode:$('#questionMode').value,
    assessmentType:$('#assessmentType').value,
    taxonomy:$('#taxonomy').value,
    optionCount:$('#optionCount').value,
    generateImagePrompts:$('#generateImagePrompts').checked,
    difficulty:$('#difficulty').value,
    generationMode:$('#generationMode')?.value||'online',
    aiModel:$('#aiModel')?.value||'auto',
    aiQuality:$('#aiQuality')?.value||'premium'
  };
  try{localStorage.setItem(CURRICULUM_STORAGE_KEY,JSON.stringify(draft))}catch{}
}
function restoreCurriculumDraft(){
  const saved=getCurriculumDraft()[getCurriculumKey()]||{};
  if($('#materialScope')) $('#materialScope').value=saved.materialScope||'single';
  renderMaterialRows(saved.materials||[]);
  $('#topic').value=([...$('#topic').options].some(o=>o.value===saved.topic))?saved.topic:$('#topic').options[0]?.value;
  $('#customTopic').value=saved.customTopic||'';
  $('#customTP').value=saved.tp||'';
  $('#printTP').checked=saved.printTP!==false;
  $('#semester').value=saved.semester||'Semester 1';
  $('#examType').value=saved.examType||'';
  $('#examTypeCustom').value=saved.examTypeCustom||'';
  updateExamTypeControls();
  $('#questionMode').value=saved.questionMode||'umum';
  $('#taxonomy').value=saved.taxonomy||'tka';
  $('#optionCount').value=saved.optionCount||'4';
  $('#generateImagePrompts').checked=saved.generateImagePrompts!==false;
  if(saved.difficulty && [...$('#difficulty').options].some(o=>o.value===saved.difficulty)) $('#difficulty').value=saved.difficulty;
  if($('#generationMode')) $('#generationMode').value=saved.generationMode||'online';
  if($('#aiModel')) $('#aiModel').value=saved.aiModel||'auto';
  if($('#aiQuality')) $('#aiQuality').value=saved.aiQuality||'premium';
  updateAiModelNote();updateGenerationModeUi();
  updateAssessmentTypeOptions(saved.assessmentType||'tka_mix');
  updateMaterialScopeControls(false);
  updateCustomTopicInput();
  updateMaterialDistributionStatus();
  updateAssessmentControls();
}
function updateCustomTopicInput(shouldFocus=false){
  const selected=$('#topic').value;
  const input=$('#customTopic');
  const wrap=$('#customTopicWrap');
  const note=$('#selectedTopicNote');
  const isCustom=selected==='__custom__';
  if(wrap) wrap.style.display=isCustom?'grid':'none';
  if(note) note.style.display=isCustom?'none':'block';
  if(isCustom){
    input.disabled=false;
    input.placeholder='Ketik materi yang diinginkan, misalnya: Ekosistem dan Rantai Makanan';
    if(shouldFocus) setTimeout(()=>input.focus(),0);
  }else{
    input.disabled=false;
    if(selected) input.value=selected;
  }
}
function subjectTopicSeeds(){
  const mode=$('#mode')?.value||'school', id=$('#subject')?.value;
  const subj=(SUBJECTS[mode]||[]).find(x=>x.id===id);
  return (subj?.topics||[]).filter(t=>t && !/^Campuran Semua Materi$/i.test(t));
}
function getMaterialRows(){
  return $$('#materialRows .material-row').map(row=>({
    name:row.querySelector('.material-name')?.value.trim()||'',
    count:Math.max(0,parseInt(row.querySelector('.material-count')?.value||'0',10)||0)
  })).filter(x=>x.name||x.count);
}
function materialRowHtml(item={},index=0){
  return `<div class="material-row"><div class="material-index">${index+1}</div><input class="material-name" type="text" maxlength="180" value="${escapeHtml(item.name||'')}" placeholder="Contoh: Bab ${index+1} — Ekosistem"><input class="material-count" type="number" min="0" max="50" value="${item.count||0}" title="Jumlah soal"><button type="button" class="remove-material" aria-label="Hapus materi">×</button></div>`;
}
function bindMaterialRows(){
  $$('#materialRows .material-row').forEach((row,idx)=>{
    row.querySelector('.material-index').textContent=idx+1;
    row.querySelector('.material-name')?.addEventListener('input',()=>{updateMaterialDistributionStatus();persistCurriculumDraft()});
    row.querySelector('.material-count')?.addEventListener('input',()=>{updateMaterialDistributionStatus();persistCurriculumDraft()});
    row.querySelector('.remove-material')?.addEventListener('click',()=>{
      row.remove();
      if(!$('#materialRows .material-row')) addMaterialRow();
      bindMaterialRows();updateMaterialDistributionStatus();persistCurriculumDraft();
    });
  });
}
function renderMaterialRows(rows=[]){
  const box=$('#materialRows'); if(!box)return;
  let list=Array.isArray(rows)?rows.filter(x=>x&&((x.name||'').trim()||+x.count)):[];
  if(!list.length) list=subjectTopicSeeds().map(name=>({name,count:0}));
  if(!list.length) list=[{name:'',count:0},{name:'',count:0}];
  box.innerHTML=list.map(materialRowHtml).join('');
  bindMaterialRows();
}
function addMaterialRow(item={name:'',count:0}){
  const box=$('#materialRows'); if(!box)return;
  box.insertAdjacentHTML('beforeend',materialRowHtml(item,$$('#materialRows .material-row').length));
  bindMaterialRows();updateMaterialDistributionStatus();
  const rows=$$('#materialRows .material-row'); rows.at(-1)?.querySelector('.material-name')?.focus();
}
function updateMaterialDistributionStatus(){
  const el=$('#materialDistributionStatus'); if(!el)return;
  const target=Math.max(1,Math.min(50,+$('#count')?.value||20));
  const rows=getMaterialRows().filter(x=>x.name);
  const total=rows.reduce((a,b)=>a+b.count,0);
  el.className='material-status';
  if(!rows.length){el.textContent='Tambahkan minimal satu bab / materi.';el.classList.add('error');return}
  if(total===target){el.textContent=`Distribusi pas: ${total} dari ${target} soal.`;el.classList.add('ok');return}
  if(total===0){el.textContent=`Belum dibagi. Total ujian ${target} soal — klik “Bagi soal otomatis”.`;return}
  el.textContent=`Distribusi ${total}/${target} soal. Sesuaikan hingga sama dengan jumlah soal.`;el.classList.add('error');
}
function autoDistributeMaterials(showToast=true){
  const rows=$$('#materialRows .material-row').filter(r=>r.querySelector('.material-name')?.value.trim());
  if(!rows.length){if(showToast)toast('Isi minimal satu bab / materi terlebih dahulu');return}
  const target=Math.max(1,Math.min(50,+$('#count').value||20));
  const base=Math.floor(target/rows.length), extra=target%rows.length;
  rows.forEach((row,i)=>{row.querySelector('.material-count').value=base+(i<extra?1:0)});
  updateMaterialDistributionStatus();persistCurriculumDraft();
  if(showToast)toast(`Distribusi ${target} soal dibagi ke ${rows.length} bab.`);
}
function updateMaterialScopeControls(autoSeed=true){
  const multi=$('#materialScope')?.value==='multi';
  const singleWrap=$('#singleTopicWrap'), multiWrap=$('#multiMaterialWrap'), customWrap=$('#customTopicWrap'), note=$('#selectedTopicNote');
  if(singleWrap)singleWrap.style.display=multi?'none':'grid';
  if(multiWrap)multiWrap.style.display=multi?'grid':'none';
  if(multi){
    if(customWrap)customWrap.style.display='none';
    if(note)note.style.display='none';
    if(autoSeed && !$$('#materialRows .material-row').length)renderMaterialRows([]);
  }else{
    updateCustomTopicInput();
  }
  updateMaterialDistributionStatus();
}
function buildMaterialQuestionPlan(meta,count){
  if(meta.materialScope!=='multi')return Array(count).fill(meta.topic);
  const remaining=(meta.materials||[]).filter(x=>x.name&&x.count>0).map(x=>({name:x.name,count:x.count}));
  const plan=[];
  while(plan.length<count && remaining.some(x=>x.count>0)){
    for(const item of remaining){
      if(item.count>0 && plan.length<count){plan.push(item.name);item.count--}
    }
  }
  return plan;
}
function getCustomTPs(){
  return $('#customTP').value.split(/\r?\n/).map(x=>x.replace(/^[-•\d.)\s]+/,'').trim()).filter(Boolean);
}
function resolveTopic(){
  const typed=$('#customTopic').value.trim();
  const selected=$('#topic').value;
  return typed || (selected==='__custom__'?'':selected);
}
function updateExamTypeControls(autoScope=false){
  const type=$('#examType').value;
  const custom=type==='CUSTOM';
  const wrap=$('#examTypeCustomWrap');
  if(wrap)wrap.style.display=custom?'grid':'none';
  if(custom&&!$('#examTypeCustom').value.trim()) $('#examTypeCustom').placeholder='Contoh: Asesmen Diagnostik Awal Semester';
  if(autoScope && $('#materialScope')){
    if(['STS','ASAS','ASAT','US','TRYOUT'].includes(type)) $('#materialScope').value='multi';
    else if(type==='HARIAN') $('#materialScope').value='single';
    updateMaterialScopeControls(true);
    if($('#materialScope').value==='multi') autoDistributeMaterials(false);
  }
}
function resolveExamTypeLabel(type,custom){
  if(type==='CUSTOM')return (custom||'Ujian / Asesmen Custom').trim();
  return ({
    TKA:'Tes Kemampuan Akademik (TKA)',
    STS:'Sumatif Tengah Semester (STS)',
    ASAS:'Asesmen Sumatif Akhir Semester (ASAS)',
    ASAT:'Asesmen Sumatif Akhir Tahun (ASAT)',
    US:'Ujian Sekolah',
    TRYOUT:'Try Out / Simulasi Ujian',
    HARIAN:'Asesmen / Ulangan Harian'
  })[type]||type||'-';
}
function captureAssessmentMeta(){
  const selected=$('#topic').value;
  const topic=resolveTopic();
  return {
    mode:$('#mode').value,
    subject:$('#subject').value,
    subjectName:subjectName(),
    grade:$('#grade').value,
    phase:$('#phase').value||'Fase D',
    semester:$('#semester').value,
    examType:$('#examType').value,
    examTypeCustom:$('#examTypeCustom').value.trim(),
    materialScope:$('#materialScope')?.value||'single',
    materials:getMaterialRows().filter(x=>x.name),
    topic,
    referenceTopic:selected,
    isCustomTopic:!!topic && topic!==selected,
    tps:getCustomTPs(),
    printTP:$('#printTP').checked,
    questionMode:$('#questionMode').value,
    assessmentType:$('#assessmentType').value,
    taxonomy:$('#taxonomy').value,
    optionCount:+$('#optionCount').value||4,
    generateImagePrompts:$('#generateImagePrompts').checked,
    difficulty:$('#difficulty').value,
    generationMode:$('#generationMode')?.value||'online',
    aiModel:$('#aiModel')?.value||'auto',
    aiQuality:$('#aiQuality')?.value||'premium'
  };
}
function applyAssessmentMeta(meta){
  if(!meta)return;
  if(['official','school'].includes(meta.mode))$('#mode').value=meta.mode;
  setSubjects(false);
  if([...$('#subject').options].some(o=>o.value===meta.subject))$('#subject').value=meta.subject;
  setTopics(false);
  const ref=meta.referenceTopic||meta.topic;
  if([...$('#topic').options].some(o=>o.value===ref)) $('#topic').value=ref;
  else $('#topic').value='__custom__';
  $('#customTopic').value=meta.materialScope==='multi'?'':(meta.topic||'');
  $('#grade').value=meta.grade||'';
  $('#phase').value=meta.phase||'Fase D';
  $('#semester').value=meta.semester||'Semester 1';
  $('#examType').value=meta.examType||'';
  $('#examTypeCustom').value=meta.examTypeCustom||'';
  if($('#materialScope')) $('#materialScope').value=meta.materialScope||'single';
  renderMaterialRows(meta.materials||[]);
  updateExamTypeControls(false);
  updateMaterialScopeControls(false);
  $('#customTP').value=(meta.tps||[]).join('\n');
  $('#printTP').checked=meta.printTP!==false;
  $('#questionMode').value=meta.questionMode||'umum';
  $('#taxonomy').value=meta.taxonomy||'tka';
  $('#optionCount').value=String(meta.optionCount||4);
  $('#generateImagePrompts').checked=meta.generateImagePrompts!==false;
  if(meta.difficulty && [...$('#difficulty').options].some(o=>o.value===meta.difficulty))$('#difficulty').value=meta.difficulty;
  if($('#generationMode'))$('#generationMode').value=meta.generationMode||'online';
  if($('#aiModel'))$('#aiModel').value=meta.aiModel||'auto';
  if($('#aiQuality'))$('#aiQuality').value=meta.aiQuality||'premium';
  updateAiModelNote();updateGenerationModeUi();
  updateAssessmentTypeOptions(meta.assessmentType||'tka_mix');
  updateCustomTopicInput();
  updateAssessmentControls();
  persistCurriculumDraft();
}
function engineTopic(customTopic,subject){
  const text=customTopic.toLowerCase();
  if(subject==='math'){
    if(/aljabar|persamaan|pola|fungsi/.test(text))return 'Aljabar';
    if(/bilangan|pecahan|rasio|perbandingan|persen/.test(text))return 'Bilangan';
    if(/geometri|bangun|keliling|luas|volume|pengukuran/.test(text))return 'Geometri & Pengukuran';
    if(/peluang|statistik|data|diagram/.test(text))return 'Data & Peluang';
  }
  if(subject==='indo'){
    if(/inferensi|evaluasi|kesimpulan/.test(text))return 'Inferensi & Evaluasi';
    if(/sastra|puisi|cerpen|pantun/.test(text))return 'Teks Sastra';
    if(/makna|kosakata|kata/.test(text))return 'Makna Kata & Informasi';
    if(/teks|informasi|bacaan/.test(text))return 'Pemahaman Teks Informasi';
  }
  return 'Campuran Semua Materi';
}

const DEFAULT_KOP_SRC = 'default-kop.png';
const KOP_STORAGE_KEY = 'tkaKopConfig';
let kopConfig = loadKopConfig();

function loadKopConfig(){
  try{
    const saved=JSON.parse(localStorage.getItem(KOP_STORAGE_KEY)||'{}');
    return {mode:saved.mode||'default', customDataUrl:saved.customDataUrl||''};
  }catch{
    return {mode:'default', customDataUrl:''};
  }
}
function persistKopConfig(){
  localStorage.setItem(KOP_STORAGE_KEY, JSON.stringify(kopConfig));
}
function getKopSrc(){
  if(kopConfig.mode==='none') return '';
  if(kopConfig.mode==='custom' && kopConfig.customDataUrl) return kopConfig.customDataUrl;
  return DEFAULT_KOP_SRC;
}
function escapeHtml(str){
  return String(str??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}
function examMeta(){
  return {
    school:'SMP SSA Negeri Jenggrong Ranuyoso',
    subject:(assessmentMeta?.subjectName||subjectName())||'-',
    grade:assessmentMeta?.grade||$('#grade').value||'-',
    phase:assessmentMeta?.phase||$('#phase').value||'Fase D',
    semester:assessmentMeta?.semester||$('#semester').value||'-',
    examType:assessmentMeta?.examType||$('#examType').value||'',
    examTypeCustom:assessmentMeta?.examTypeCustom||$('#examTypeCustom').value||'',
    topic:assessmentMeta?.materialSummary||assessmentMeta?.topic||resolveTopic()||'-',
    tps:assessmentMeta?.tps||[],
    printTP:assessmentMeta?.printTP??$('#printTP').checked,
    assessmentType:assessmentMeta?.assessmentType||$('#assessmentType').value||'tka_mix',
    questionMode:assessmentMeta?.questionMode||$('#questionMode').value||'umum',
    taxonomy:assessmentMeta?.taxonomy||$('#taxonomy').value||'tka',
    aiEngine:assessmentMeta?.aiEngine||'',
    aiReviewEngine:assessmentMeta?.aiReviewEngine||'',
    aiQuality:assessmentMeta?.aiQuality||'',
    total:currentQuestions.length||0
  };
}
function assessmentTypeLabel(v){
  return ({tka_mix:'Campuran TKA',pg:'Pilihan Ganda',isian:'Isian Singkat',uraian:'Uraian'})[v]||v||'-';
}
function taxonomyLabel(v){
  return ({tka:'Level TKA',bloom:'Taksonomi Bloom',solo:'Taksonomi SOLO'})[v]||v||'-';
}
function headerHtml(forWord=false){
  const src=getKopSrc();
  const meta=examMeta();
  const examLabel=resolveExamTypeLabel(meta.examType,meta.examTypeCustom);
  const title=examLabel.toUpperCase();
  const imageBlock=src?`<div class="kop-sheet"><img style="display:block;width:100%;max-width:900px;height:auto;margin:0 auto" src="${src}" alt="Kop soal"></div>`:'';
  const tpBlock=(meta.printTP&&meta.tps.length)?`<div class="exam-tp-list"><strong>Tujuan Pembelajaran / Indikator:</strong><ol>${meta.tps.map(tp=>`<li>${escapeHtml(tp)}</li>`).join('')}</ol></div>`:'';
  const cells=[
    ['Sekolah',meta.school],['Jenis Ujian',examLabel],['Mata Pelajaran',meta.subject],['Kelas / Semester',`${meta.grade} / ${meta.semester}`],
    ['Fase',meta.phase],['Cakupan Materi',meta.topic],['Bentuk / Komposisi Soal',assessmentTypeLabel(meta.assessmentType)],['Sistem Level',taxonomyLabel(meta.taxonomy)],['Jumlah Soal',meta.total]
  ];
  if(forWord){
    const rows=[]; for(let i=0;i<cells.length;i+=2){rows.push(`<tr>${cells.slice(i,i+2).map(c=>`<td style="padding:5px 8px;border:0;width:50%"><b>${escapeHtml(c[0])}</b><br>${escapeHtml(c[1])}</td>`).join('')}</tr>`)}
    return `${imageBlock}<div style="border:1px solid #d9dfe8;padding:12px 14px;margin-top:10px;background:#fff"><h3 style="margin:0 0 8px;font-size:18px;text-align:center">${title}</h3><table style="width:100%;font-size:12px;border-collapse:collapse">${rows.join('')}</table>${tpBlock}</div>`;
  }
  return `<div class="print-sheet-head">${imageBlock}<div class="exam-meta"><h3>${title}</h3><div class="exam-meta-grid">${cells.map(c=>`<div><span>${escapeHtml(c[0])}</span><strong>${escapeHtml(c[1])}</strong></div>`).join('')}</div>${tpBlock}<div class="print-note">Kop dapat diganti melalui menu <b>Kop Cetak Soal</b>. Data paket mengikuti konfigurasi saat Generate.</div></div></div>`;
}
function updateKopPreview(){
  const img=$('#kopPreviewImg'), empty=$('#kopPreviewEmpty'), mode=$('#kopMode');
  if(mode) mode.value=kopConfig.mode;
  const src=getKopSrc();
  if(src){
    img.src=src; img.style.display='block'; if(empty) empty.style.display='none';
  } else {
    img.removeAttribute('src'); img.style.display='none'; if(empty) empty.style.display='block';
  }
  if(currentQuestions.length) renderAll();
}
async function handleKopUpload(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    kopConfig.mode='custom';
    kopConfig.customDataUrl=String(reader.result||'');
    persistKopConfig();
    updateKopPreview();
    toast('Kop custom berhasil diunggah');
  };
  reader.readAsDataURL(file);
}

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function rnd(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function shuffle(arr){return arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1])}
function rupiah(n){return 'Rp'+n.toLocaleString('id-ID')+',00'}

function setSubjects(restore=true){
  const mode=$('#mode').value,sub=$('#subject');
  const prev=sub.value; sub.innerHTML='';
  SUBJECTS[mode].forEach(s=>sub.add(new Option(s.name,s.id)));
  if([...sub.options].some(o=>o.value===prev))sub.value=prev;
  $('#modeLabel').textContent=mode==='official'?'TKA SMP Resmi':'Ujian Sekolah Bergaya TKA';
  setTopics(restore);
  updateAssessmentTypeOptions();
}
function setTopics(restore=true){
  const mode=$('#mode').value,id=$('#subject').value;
  const s=SUBJECTS[mode].find(x=>x.id===id);const topic=$('#topic');topic.innerHTML='';
  (s?.topics||[]).forEach(t=>topic.add(new Option(t,t)));
  topic.add(new Option('✎ Materi lainnya / custom','__custom__'));
  if(restore)restoreCurriculumDraft();else{updateCustomTopicInput();if($('#materialScope')?.value==='multi'){renderMaterialRows([]);autoDistributeMaterials(false)}}
}
function updateAssessmentTypeOptions(preferred){
  const sel=$('#assessmentType'); if(!sel)return;
  const current=preferred||sel.value||'tka_mix';
  const allowed=$('#mode').value==='official'
    ? [['tka_mix','Campuran TKA — PG + PG Kompleks'],['pg','Pilihan Ganda']]
    : [['tka_mix','Campuran TKA — PG + PG Kompleks'],['pg','Pilihan Ganda'],['isian','Isian Singkat'],['uraian','Uraian']];
  sel.innerHTML=''; allowed.forEach(([v,l])=>sel.add(new Option(l,v)));
  sel.value=allowed.some(x=>x[0]===current)?current:'tka_mix';
  updateAssessmentControls();
}
function updateAssessmentControls(){
  const type=$('#assessmentType')?.value||'tka_mix';
  const composition=$('#compositionSection');
  if(composition)composition.style.display=type==='tka_mix'?'block':'none';
  if($('#optionCount'))$('#optionCount').disabled=!['tka_mix','pg'].includes(type);
  const tax=$('#taxonomy')?.value||'tka';
  const hint=$('#taxonomyHint');
  if(hint){
    hint.textContent=tax==='bloom'
      ? 'Bloom: soal akan dilabeli C2 Memahami, C3 Menerapkan, serta C4–C6 untuk penalaran/HOTS.'
      : tax==='solo'
      ? 'SOLO: soal akan dilabeli Unistruktural, Multistruktural, Relational, dan Extended Abstract.'
      : 'Mode TKA menggunakan profil Memahami → Mengaplikasikan → Penalaran.';
  }
}
function levelFor(i,count,diff){
  const p=i/Math.max(1,count);
  if(diff==='easy')return p<.55?'Memahami':p<.88?'Mengaplikasikan':'Penalaran';
  if(diff==='hard')return p<.15?'Memahami':p<.5?'Mengaplikasikan':'Penalaran';
  if(diff==='medium')return p<.2?'Memahami':p<.7?'Mengaplikasikan':'Penalaran';
  return p<.3?'Memahami':p<.7?'Mengaplikasikan':'Penalaran';
}
function taxonomyLevel(base,index,taxonomy){
  if(taxonomy==='bloom'){
    if(base==='Memahami')return 'C2 — Memahami';
    if(base==='Mengaplikasikan')return 'C3 — Menerapkan';
    return ['C4 — Menganalisis','C5 — Mengevaluasi','C6 — Mencipta'][index%3];
  }
  if(taxonomy==='solo'){
    if(base==='Memahami')return index%2?'Unistruktural':'Multistruktural';
    if(base==='Mengaplikasikan')return 'Multistruktural';
    return index%2?'Relational':'Extended Abstract';
  }
  return base;
}
function formatPlan(count){
  const a=+$(`#mixPg`).value,b=+$(`#mixMcma`).value,c=+$(`#mixCat`).value,total=Math.max(1,a+b+c);
  let pg=Math.round(count*a/total),mcma=Math.round(count*b/total);let cat=count-pg-mcma;
  if(cat<0){cat=0;pg=count-mcma}
  return shuffle([...Array(pg).fill('PG'),...Array(mcma).fill('PGK-MCMA'),...Array(cat).fill('PGK-Kategori')]);
}
function assessmentPlan(count){
  const type=$('#assessmentType').value;
  if(type==='pg')return Array(count).fill('PG');
  if(type==='isian')return Array(count).fill('Isian');
  if(type==='uraian')return Array(count).fill('Uraian');
  return formatPlan(count);
}

const contexts = () => $$('#contextChips .selected').map(x=>x.dataset.context);
function contextText(){return pick(contexts().length?contexts():['sekolah']);}

function buildMath(i,format,level,topic){
  const ctx=contextText();
  const templates=['discount','ratio','linear','geometry','data','probability','sequence'];
  let type=pick(templates);
  if(topic.includes('Bilangan')) type=pick(['discount','ratio']);
  if(topic.includes('Aljabar')) type=pick(['linear','sequence']);
  if(topic.includes('Geometri')) type='geometry';
  if(topic.includes('Data')) type=pick(['data','probability']);

  if(type==='discount'){
    const pen=rnd(8,18)*1000, pencil=rnd(4,10)*1000, qty=4;
    const cheap=Math.min(pen,pencil), total=2*pen+2*pencil-cheap;
    const stim=`Koperasi sekolah mengadakan promo \"Hemat Berempat\". Setiap pembelian 4 barang memperoleh potongan sebesar harga 1 barang termurah. Rani membeli 2 pulpen seharga ${rupiah(pen)} per buah dan 2 pensil seharga ${rupiah(pencil)} per buah.`;
    if(format==='PG'){
      const opts=shuffle([total,total+cheap,total-cheap,total+2000]).map(rupiah);return qObj('Operasi aritmetika pada bilangan', 'Bilangan', level,format,stim,'Berapa total yang harus dibayar Rani?',opts,[opts.indexOf(rupiah(total))],`Jumlah awal dikurangi harga satu barang termurah = ${rupiah(total)}.`)
    }
    return mathComplex('Operasi aritmetika pada bilangan','Bilangan',level,format,stim,total,cheap);
  }
  if(type==='ratio'){
    const a=rnd(2,5),b=rnd(3,7), total=(a+b)*rnd(4,10), x=total*a/(a+b),y=total*b/(a+b);
    const stim=`Dalam kegiatan penghijauan sekolah, bibit mangga dan jambu dibagikan dengan perbandingan ${a}:${b}. Jumlah seluruh bibit ${total} batang.`;
    if(format==='PG'){
      const correct=x;const opts=shuffle([correct,y,correct+a,Math.max(1,correct-b)]).map(n=>`${n} batang`);return qObj('Rasio dan proporsi','Bilangan',level,format,stim,'Berapa banyak bibit mangga?',opts,[opts.indexOf(`${correct} batang`)],`Bagian mangga = ${a}/(${a}+${b}) × ${total} = ${correct}.`)
    }
    const st=[`Bibit mangga berjumlah ${x} batang.`,`Bibit jambu berjumlah ${y} batang.`,`Selisih keduanya ${Math.abs(y-x)} batang.`,`Jumlah bibit mangga dan jambu ${total+a} batang.`];return complexFromStatements('Rasio dan proporsi','Bilangan',level,format,stim,st,[0,1,2]);
  }
  if(type==='linear'){
    const x=rnd(4,12),a=rnd(2,6),b=rnd(3,15),c=a*x+b;
    const stim=`Sebuah layanan fotokopi menetapkan biaya tetap ${rupiah(b*1000)} ditambah ${rupiah(a*1000)} untuk setiap paket cetak. Total pembayaran Dimas ${rupiah(c*1000)}.`;
    if(format==='PG'){const opts=shuffle([x,x+1,x-1,x+2]).map(n=>`${n} paket`);return qObj('Persamaan linear satu variabel','Aljabar',level,format,stim,'Berapa paket cetak yang dibeli Dimas?',opts,[opts.indexOf(`${x} paket`)],`Model: ${a}x + ${b} = ${c}, sehingga x = ${x}.`)}
    const st=[`Model matematikanya ${a}x + ${b} = ${c}.`,`Nilai x adalah ${x}.`,`Jika membeli ${x+1} paket, total biaya ${rupiah((a*(x+1)+b)*1000)}.`,`Biaya tetap berubah mengikuti jumlah paket.`];return complexFromStatements('Persamaan linear satu variabel','Aljabar',level,format,stim,st,[0,1,2]);
  }
  if(type==='geometry'){
    const p=rnd(8,18),l=rnd(5,12),area=p*l,per=2*(p+l);
    const stim=`Taman sekolah berbentuk persegi panjang dengan panjang ${p} m dan lebar ${l} m. Sekolah akan memasang pagar di sekeliling taman dan menanam rumput pada seluruh permukaannya.`;
    if(format==='PG'){const opts=shuffle([per,area,p+l,2*p+l]).map(n=>`${n} m`);return qObj('Keliling dan luas bangun datar','Geometri & Pengukuran',level,format,stim,'Berapa meter pagar minimum yang diperlukan?',opts,[opts.indexOf(`${per} m`)],`Keliling = 2 × (${p}+${l}) = ${per} m.`)}
    const st=[`Luas taman ${area} m².`,`Keliling taman ${per} m.`,`Jika lebar ditambah 1 m, luas menjadi ${p*(l+1)} m².`,`Panjang diagonal taman pasti ${p+l} m.`];return complexFromStatements('Keliling dan luas bangun datar','Geometri & Pengukuran',level,format,stim,st,[0,1,2]);
  }
  if(type==='data'){
    const vals=[rnd(60,90),rnd(60,90),rnd(60,90),rnd(60,90),rnd(60,90)]; const sum=vals.reduce((a,b)=>a+b,0),avg=sum/5;
    const stim=`Nilai lima latihan Matematika seorang murid adalah ${vals.join(', ')}.`;
    if(format==='PG'){const corr=Math.round(avg*10)/10;const opts=shuffle([corr,corr+2,corr-2,Math.max(...vals)]).map(n=>String(n));return qObj('Rata-rata data','Data & Peluang',level,format,stim,'Berapakah rata-rata kelima nilai tersebut?',opts,[opts.indexOf(String(corr))],`Rata-rata = jumlah nilai ÷ 5 = ${corr}.`)}
    const med=[...vals].sort((a,b)=>a-b)[2];const st=[`Nilai tertinggi adalah ${Math.max(...vals)}.`,`Median data adalah ${med}.`,`Rentang data adalah ${Math.max(...vals)-Math.min(...vals)}.`,`Rata-rata pasti sama dengan median.`];return complexFromStatements('Representasi dan analisis data','Data & Peluang',level,format,stim,st,[0,1,2]);
  }
  if(type==='probability'){
    const r=rnd(2,5),b=rnd(2,5),g=rnd(1,4),tot=r+b+g;
    const stim=`Sebuah kotak berisi ${r} bola merah, ${b} bola biru, dan ${g} bola hijau. Satu bola diambil secara acak.`;
    if(format==='PG'){const opts=shuffle([`${r}/${tot}`,`${b}/${tot}`,`${g}/${tot}`,`1/${tot}`]);return qObj('Peluang kejadian tunggal','Data & Peluang',level,format,stim,'Peluang terambil bola merah adalah ...',opts,[opts.indexOf(`${r}/${tot}`)],`Peluang = banyak kejadian yang diinginkan ÷ jumlah seluruh kejadian = ${r}/${tot}.`)}
    const st=[`Peluang merah adalah ${r}/${tot}.`,`Peluang bukan merah adalah ${b+g}/${tot}.`,`Jumlah seluruh peluang warna adalah 1.`,`Peluang hijau lebih besar dari 1.`];return complexFromStatements('Peluang kejadian tunggal','Data & Peluang',level,format,stim,st,[0,1,2]);
  }
  const start=rnd(2,7),d=rnd(2,6),n=rnd(6,10),nth=start+(n-1)*d;
  const stim=`Susunan kursi pada sebuah kegiatan membentuk pola aritmetika: baris pertama ${start} kursi dan setiap baris berikutnya bertambah ${d} kursi.`;
  if(format==='PG'){const opts=shuffle([nth,nth+d,nth-d,start+n*d]).map(n=>`${n} kursi`);return qObj('Barisan bilangan','Aljabar',level,format,stim,`Berapa jumlah kursi pada baris ke-${n}?`,opts,[opts.indexOf(`${nth} kursi`)],`Suku ke-${n}: ${start}+(${n}-1)×${d} = ${nth}.`)}
  const st=[`Beda barisan adalah ${d}.`,`Suku ke-${n} adalah ${nth}.`,`Suku kedua adalah ${start+d}.`,`Barisan tersebut merupakan barisan geometri.`];return complexFromStatements('Barisan bilangan','Aljabar',level,format,stim,st,[0,1,2]);
}

function mathComplex(comp,topic,level,format,stim,total,cheap){
 const st=[`Harga sebelum diskon adalah ${rupiah(total+cheap)}.`,`Potongan yang diperoleh sebesar ${rupiah(cheap)}.`,`Total setelah diskon adalah ${rupiah(total)}.`,`Total setelah diskon lebih besar dari harga awal.`];return complexFromStatements(comp,topic,level,format,stim,st,[0,1,2]);
}

const readingTexts=[
 {title:'Program Bank Sampah',text:'OSIS mengajak setiap kelas memilah sampah kertas, plastik, dan organik. Sampah yang memiliki nilai jual ditimbang setiap Jumat. Hasil penjualan digunakan untuk membeli bibit tanaman dan perlengkapan kebersihan. Dalam tiga bulan, volume sampah tercampur di sekolah berkurang dan murid mulai terbiasa membawa botol minum sendiri.',main:'Program bank sampah mendorong kebiasaan mengelola sampah sekaligus mendukung kebersihan sekolah.',infer:'Kegiatan yang konsisten dapat membentuk kebiasaan ramah lingkungan.',word:'volume',meaning:'jumlah atau banyaknya'},
 {title:'Perpustakaan Pagi',text:'Sekolah membuka perpustakaan tiga puluh menit sebelum pelajaran dimulai. Murid dapat membaca, meminjam buku, atau berdiskusi singkat tentang bacaan. Guru piket mencatat jenis buku yang paling diminati. Data itu kemudian digunakan untuk menambah koleksi yang sesuai kebutuhan murid.',main:'Layanan perpustakaan pagi memperluas kesempatan membaca dan membantu sekolah memilih koleksi yang relevan.',infer:'Data minat baca dapat dipakai untuk pengambilan keputusan.',word:'relevan',meaning:'sesuai dengan kebutuhan atau keadaan'},
 {title:'Hemat Air',text:'Pada musim kemarau, debit air di beberapa sumur warga menurun. Karang taruna memasang poster hemat air dan mengajak warga menampung air hujan saat tersedia. Warga juga memeriksa keran bocor secara berkala. Langkah sederhana itu membantu mengurangi pemborosan air bersih.',main:'Penghematan air dapat dilakukan melalui kebiasaan sederhana dan kerja bersama.',infer:'Ketersediaan air perlu dikelola terutama saat musim kemarau.',word:'debit',meaning:'jumlah aliran air dalam waktu tertentu'}
];

function buildIndo(i,format,level,topic){
 const t=pick(readingTexts); const stim=`${t.title}\n\n${t.text}`;
 const kinds=['main','infer','evidence','word']; let kind=pick(kinds);
 if(topic.includes('Inferensi'))kind=pick(['infer','evidence']); if(topic.includes('Makna'))kind='word';
 if(format==='PG'){
   if(kind==='main'){const opts=shuffle([t.main,'Semua kegiatan sekolah harus dilakukan setiap hari.','Murid hanya boleh belajar melalui buku perpustakaan.','Program sekolah tidak membutuhkan data.']);return qObj('Memahami isi teks','Pemahaman Teks',level,format,stim,'Gagasan utama teks tersebut adalah ...',opts,[opts.indexOf(t.main)],'Gagasan utama merangkum keseluruhan isi teks, bukan detail tertentu.')}
   if(kind==='infer'){const opts=shuffle([t.infer,'Kegiatan tersebut pasti menghabiskan biaya besar.','Semua warga memiliki kebiasaan yang sama sejak awal.','Program tidak memerlukan evaluasi.']);return qObj('Membuat inferensi','Inferensi & Evaluasi',level,format,stim,'Simpulan yang paling logis berdasarkan teks adalah ...',opts,[opts.indexOf(t.infer)],'Simpulan harus didukung informasi dalam teks dan tidak melampaui bukti yang tersedia.')}
   if(kind==='word'){const opts=shuffle([t.meaning,'nama tempat','urutan kejadian','pendapat pribadi']);return qObj('Menentukan makna kata dalam konteks','Makna Kata',level,format,stim,`Makna kata “${t.word}” pada teks adalah ...`,opts,[opts.indexOf(t.meaning)],'Makna kata ditentukan berdasarkan konteks kalimat tempat kata digunakan.')}
   const corr='Pernyataan yang dapat diverifikasi langsung dari informasi pada teks.';const opts=shuffle([corr,'Pernyataan yang hanya berdasarkan dugaan pembaca.','Pendapat yang tidak berkaitan dengan isi teks.','Informasi baru yang tidak disebutkan atau disiratkan.']);return qObj('Mengevaluasi bukti teks','Inferensi & Evaluasi',level,format,stim,'Ciri bukti yang kuat untuk menjawab pertanyaan berdasarkan teks adalah ...',opts,[opts.indexOf(corr)],'Bukti harus dapat ditelusuri pada isi teks.')
 }
 const statements=[`Judul teks sesuai dengan isi bacaan.`,`Teks memuat tindakan atau program yang dilakukan bersama.`,`Salah satu informasi dapat digunakan untuk menyimpulkan dampak kegiatan.`,`Teks menyatakan bahwa semua masalah selesai secara permanen.`];
 return complexFromStatements('Memahami dan mengevaluasi teks',topic==='Campuran Semua Materi'?'Pemahaman Teks':topic,level,format,stim,statements,[0,1,2]);
}

function buildGeneric(subject,i,format,level,topic){
 const subjectTitle = SUBJECTS.school.find(s=>s.id===subject)?.name || subjectName();
 const templates={
   gsm:{comp:'Menerapkan adab dan pemahaman dasar dalam kegiatan mengaji',stim:'Pada kegiatan Gerakan Sekolah Mengaji, murid membaca secara bergiliran. Ketika temannya membaca, murid lain menyimak dengan tenang dan memberi koreksi dengan bahasa yang santun.',q:'Sikap yang paling sesuai dengan tujuan kegiatan tersebut adalah ...',correct:'Menyimak bacaan dengan tertib dan memberi koreksi secara santun.'},
   tahfidz:{comp:'Memahami keterkaitan membaca, menghafal, dan mentadaburi Al-Qur’an',stim:'Seorang murid mengulang hafalan beberapa ayat, memperhatikan tajwid, lalu mendiskusikan pesan utama ayat bersama guru.',q:'Kegiatan tersebut menunjukkan bahwa tahfidz yang baik juga perlu disertai ...',correct:'ketepatan bacaan dan pemahaman makna ayat.'},
   pai:{comp:'Menerapkan nilai agama dan budi pekerti dalam kehidupan',stim:'Saat kerja kelompok, seorang murid menemukan dompet di ruang kelas. Ia menyerahkannya kepada guru agar dapat dikembalikan kepada pemiliknya.',q:'Perilaku tersebut paling tepat mencerminkan nilai ...',correct:'jujur dan amanah.'},
   konghucu:{comp:'Menerapkan nilai kebajikan dan budi pekerti',stim:'Dalam kegiatan kelas, setiap murid diberi kesempatan menyampaikan pendapat. Mereka mendengarkan teman berbicara tanpa mengejek dan mencari keputusan yang baik bersama.',q:'Sikap yang paling sesuai dengan budi pekerti dalam situasi tersebut adalah ...',correct:'menghormati sesama dan menjaga keharmonisan.'},
   kepercayaan:{comp:'Menerapkan nilai luhur dan budi pekerti dalam kehidupan',stim:'Murid dari latar belakang keyakinan yang berbeda bekerja sama membersihkan lingkungan sekolah dan saling menghormati saat masing-masing menjalankan ibadah.',q:'Nilai utama yang tampak pada situasi tersebut adalah ...',correct:'toleransi dan gotong royong.'},
   pancasila:{comp:'Menerapkan nilai Pancasila dalam kehidupan',stim:'Dalam rapat kelas, terdapat tiga usulan kegiatan. Ketua kelas memberi kesempatan semua murid menyampaikan alasan sebelum keputusan diambil bersama.',q:'Nilai yang paling tampak pada situasi tersebut adalah ...',correct:'Musyawarah dengan menghargai pendapat orang lain.'},
   project:{comp:'Menganalisis tahapan pembelajaran berbasis projek',stim:'Kelompok murid mengamati masalah sampah plastik di sekolah, mengumpulkan data, menyusun rencana pengurangan sampah, melaksanakan aksi, lalu mempresentasikan hasilnya.',q:'Langkah yang menunjukkan penggunaan data sebelum menentukan solusi adalah ...',correct:'mengumpulkan informasi tentang masalah sampah terlebih dahulu.'},
   english:{comp:'Memahami informasi dalam teks Bahasa Inggris sederhana',stim:'The school library opens at 07.00 and closes at 14.00. Students must return borrowed books before the due date.',q:'What should students do with borrowed books?',correct:'Return them before the due date.'},
   local:{comp:'Memahami penggunaan bahasa daerah sesuai konteks',stim:'Seorang murid berbicara kepada guru menggunakan pilihan kata yang lebih santun daripada ketika berbicara dengan teman sebaya.',q:'Perbedaan pilihan bahasa tersebut menunjukkan pentingnya ...',correct:'menyesuaikan ragam bahasa dengan lawan bicara dan situasi.'},
   ipa:{comp:'Menerapkan konsep sains pada situasi sehari-hari',stim:'Sekelompok murid mengamati tanaman di dua tempat. Tanaman A mendapat cahaya cukup dan disiram teratur, sedangkan tanaman B ditempatkan di ruang gelap dengan jumlah air yang sama.',q:'Kesimpulan yang paling tepat dari rancangan pengamatan tersebut adalah ...',correct:'Cahaya dapat diuji sebagai salah satu faktor yang memengaruhi pertumbuhan tanaman.'},
   ips:{comp:'Menganalisis hubungan sebab-akibat sosial',stim:'Setelah jalan desa diperbaiki, waktu tempuh hasil pertanian menuju pasar menjadi lebih singkat. Pedagang dari luar desa juga lebih sering datang membeli hasil panen.',q:'Dampak ekonomi yang paling mungkin terjadi adalah ...',correct:'Akses pasar membaik sehingga peluang transaksi hasil pertanian meningkat.'},
   codingai:{comp:'Menerapkan berpikir komputasional dan etika kecerdasan artifisial',stim:'Sebuah aplikasi membantu memilah gambar sampah organik dan anorganik. Hasil aplikasi kadang keliru sehingga murid memeriksa kembali beberapa contoh sebelum memakai hasilnya.',q:'Tindakan murid tersebut menunjukkan bahwa keluaran AI sebaiknya ...',correct:'diverifikasi karena dapat mengandung kesalahan.'},
   pjok:{comp:'Menerapkan prinsip kebugaran dan kesehatan',stim:'Sebelum bermain bola, siswa melakukan pemanasan bertahap dan setelah kegiatan melakukan pendinginan serta minum air secukupnya.',q:'Tujuan utama pemanasan sebelum aktivitas fisik adalah ...',correct:'menyiapkan tubuh agar lebih siap bergerak dan mengurangi risiko cedera.'},
   bk:{comp:'Menganalisis strategi pengembangan diri dan belajar',stim:'Seorang murid merasa tugasnya menumpuk. Ia membuat daftar prioritas, membagi waktu belajar, dan meminta bantuan guru untuk bagian yang belum dipahami.',q:'Strategi yang paling tepat pada situasi tersebut adalah ...',correct:'mengatur prioritas dan mencari bantuan ketika diperlukan.'},
   senibudaya:{comp:'Menganalisis proses penciptaan dan apresiasi karya seni',stim:'Kelompok siswa membuat poster budaya lokal. Mereka memilih simbol daerah, mengatur komposisi, kemudian meminta masukan sebelum menyelesaikan karya.',q:'Kegiatan meminta masukan sebelum karya selesai merupakan bagian dari ...',correct:'evaluasi dan penyempurnaan karya.'},
   prakarya:{comp:'Mengevaluasi proses dan hasil karya',stim:'Kelompok murid membuat wadah dari bahan lunak buatan. Produk pertama mudah berubah bentuk karena dindingnya terlalu tipis. Mereka kemudian menambah ketebalan dan memperkuat bagian dasar.',q:'Tindakan perbaikan tersebut menunjukkan ...',correct:'Evaluasi fungsi produk digunakan untuk memperbaiki desain.'},
   informatika:{comp:'Menerapkan konsep informatika untuk memecahkan masalah',stim:'Data kehadiran siswa disimpan dalam tabel. Untuk menemukan siswa yang sering terlambat, data diurutkan berdasarkan jumlah keterlambatan dan kemudian dibandingkan.',q:'Proses tersebut merupakan contoh ...',correct:'pengolahan data untuk memperoleh informasi yang berguna.'}
 };
 const data=templates[subject] || {comp:`Menganalisis informasi pada ${subjectTitle}`,stim:`Dalam pembelajaran ${subjectTitle}, guru memberikan sebuah situasi kontekstual yang berkaitan dengan materi ${topic}. Murid diminta mengamati informasi, membandingkan bukti, dan memberikan alasan atas jawabannya.`,q:'Tindakan yang paling tepat untuk menjawab soal berbasis stimulus adalah ...',correct:'Menggunakan informasi pada stimulus dan konsep yang relevan untuk menyusun alasan.'};
 if(format==='PG'){
   const distractors = subject==='english'
     ? ['Keep the books forever.','Return them only when the library closes.','Give them to another student without permission.']
     : ['Mengabaikan informasi penting pada stimulus.','Mengambil keputusan tanpa alasan yang dapat diuji.','Memilih jawaban hanya karena terlihat paling panjang.'];
   const opts=shuffle([data.correct,...distractors]);
   return qObj(data.comp,topic,level,format,data.stim,data.q,opts,[opts.indexOf(data.correct)],'Jawaban dipilih berdasarkan hubungan paling logis antara informasi pada stimulus dan konsep yang diuji.');
 }
 const st= subject==='english'
   ? [data.correct,'The answer should be supported by the information in the text.','Readers need to identify relevant details before deciding.','Every statement is correct as long as it is in English.']
   : [data.correct,'Kesimpulan harus didukung informasi pada stimulus.','Diperlukan alasan yang logis untuk menilai pernyataan.','Semua pilihan selalu benar jika berkaitan dengan topik.'];
 return complexFromStatements(data.comp,topic,level,format,data.stim,st,[0,1,2]);
}

function qObj(comp,topic,level,format,stim,q,opts,answers,explanation){
  return {id:crypto.randomUUID?.()||String(Date.now()+Math.random()),comp,topic,level,format,stimulus:stim,question:q,options:opts,answers,explanation};
}
function complexFromStatements(comp,topic,level,format,stim,statements,trueIdx){
  if(format==='PGK-Kategori')return qObj(comp,topic,level,format,stim,'Tentukan Benar atau Salah untuk setiap pernyataan berikut.',statements,trueIdx,'Pernyataan dinilai satu per satu berdasarkan konsep dan informasi pada stimulus.');
  return qObj(comp,topic,level,format,stim,'Pilih semua pernyataan yang benar.',statements,trueIdx,'Lebih dari satu jawaban dapat benar. Pilih seluruh pernyataan yang sesuai.');
}
function formatName(f){
  return ({PG:'Pilihan Ganda','PGK-MCMA':'PG Kompleks MCMA','PGK-Kategori':'PG Kompleks Kategori',Isian:'Isian Singkat',Uraian:'Uraian'})[f]||f;
}
function subjectName(){return $('#subject').selectedOptions[0]?.textContent||''}
function correctOptionText(q){
  if(q.answerText)return q.answerText;
  if(!q.options?.length)return '';
  if(q.format==='PG')return q.options[q.answers?.[0]??0]||'';
  if(q.format==='PGK-MCMA')return (q.answers||[]).map(i=>q.options[i]).filter(Boolean).join('; ');
  if(q.format==='PGK-Kategori')return q.options.map((o,i)=>`${o}: ${(q.answers||[]).includes(i)?'Benar':'Salah'}`).join('; ');
  return '';
}
function getKey(q){
  const letters='ABCDE';
  if(q.format==='PG')return letters[q.answers?.[0]]||'-';
  if(q.format==='PGK-MCMA')return (q.answers||[]).map(i=>letters[i]).join(', ')||'-';
  if(q.format==='PGK-Kategori')return (q.options||[]).map((_,i)=>`${letters[i]} ${(q.answers||[]).includes(i)?'Benar':'Salah'}`).join('; ');
  if(q.format==='Isian')return q.answerText||'-';
  if(q.format==='Uraian')return q.answerText||q.explanation||'Gunakan rubrik.';
  return '-';
}
function getPoint(q){
  if(Number.isFinite(+q.poin)&&+q.poin>0)return +q.poin;
  if(q.format==='PG')return 1;
  if(q.format==='PGK-MCMA'||q.format==='PGK-Kategori')return 2;
  if(q.format==='Isian')return 2;
  if(q.format==='Uraian')return /C4|C5|C6|Penalaran|Relational|Extended/i.test(q.level||'')?10:5;
  return 1;
}
function ensurePgOptionCount(q,count){
  if(q.format!=='PG'||!q.options?.length)return q;
  const correct=q.options[q.answers?.[0]??0];
  let distractors=q.options.filter((_,i)=>i!==(q.answers?.[0]??0));
  const generic=['Tidak dapat ditentukan dari informasi yang tersedia.','Semua informasi pada stimulus harus diabaikan.','Tidak ada pilihan yang sesuai dengan konsep yang digunakan.'];
  while(distractors.length<count-1){
    const next=generic.find(x=>x!==correct&&!distractors.includes(x))||`Pilihan alternatif ${distractors.length+1}`;
    distractors.push(next);
  }
  distractors=distractors.slice(0,Math.max(1,count-1));
  const opts=shuffle([correct,...distractors]);
  q.options=opts;q.answers=[opts.indexOf(correct)];
  return q;
}
function convertQuestionFormat(q,target){
  if(target==='PG')return q;
  const expected=correctOptionText(q)||q.explanation||'Jawaban sesuai konsep pada stimulus.';
  if(target==='Isian'){
    q.format='Isian';q.answerText=expected;q.options=[];q.answers=[];q.poin=2;
    return q;
  }
  if(target==='Uraian'){
    q.format='Uraian';q.answerText=`Jawaban inti: ${expected}. ${q.explanation||''}`.trim();q.options=[];q.answers=[];
    if(!/jelaskan|uraikan|analisis|alasan/i.test(q.question))q.question+= ' Jelaskan alasan atau langkah penyelesaianmu secara runtut.';
    q.poin=/C4|C5|C6|Penalaran|Relational|Extended/i.test(q.level||'')?10:5;
    return q;
  }
  return q;
}
function applyQuestionMode(q,meta){
  q.literacy=meta.questionMode==='literasi';
  if(q.literacy){
    q.teksBacaan=q.stimulus;
    if((q.stimulus||'').length<170){
      q.stimulus=`Bacalah informasi berikut dengan cermat.\n\n${q.stimulus}\n\nGunakan informasi pada bacaan dan konsep yang relevan untuk menjawab pertanyaan.`;
    }
  }else q.teksBacaan='';
  return q;
}
function buildIndicator(q,meta){
  const level=q.level||'',comp=String(q.comp||'konsep yang diuji').trim();
  const verb=/C5|Mengevaluasi|Extended|Penalaran/i.test(level)?'Mengevaluasi':/C4|Relational|Menganalisis/i.test(level)?'Menganalisis':/C3|Mengaplikasikan|Menerapkan|Multistruktural/i.test(level)?'Menerapkan':'Mengidentifikasi';
  const startsWithVerb=/^(memahami|menganalisis|mengidentifikasi|menentukan|menerapkan|menjelaskan|membandingkan|menilai|menggunakan|menyimpulkan|menafsirkan)/i.test(comp);
  const core=startsWithVerb?comp.charAt(0).toUpperCase()+comp.slice(1):`${verb} konsep ${comp.toLowerCase()}`;
  return `${core} pada materi ${q.materi||q.topic||meta.topic} berdasarkan stimulus yang diberikan.`;
}
function updateAiModelNote(){
  const model=$('#aiModel')?.value||'auto', quality=$('#aiQuality')?.value||'premium';
  const labels={
    auto:'Auto Premium memakai GPT-5.6 Sol sebagai utama dengan fallback Claude Opus 5.5 dan Gemini 3.1 Pro Preview jika provider utama gagal.',
    openai:'GPT-5.6 Sol: model flagship OpenAI untuk pekerjaan profesional kompleks dan reasoning kuat.',
    claude:'Claude Opus 5.5: model Anthropic kelas atas untuk reasoning panjang dan knowledge work kompleks.',
    gemini:'Gemini 3.1 Pro Preview: model Google kelas Pro untuk reasoning kompleks dan konteks panjang.'
  };
  const q=quality==='max'?' Premium Max akan mengaudit ulang hasil dengan model frontier kedua sebelum paket ditampilkan.':'';
  if($('#aiModelNote'))$('#aiModelNote').textContent=(labels[model]||labels.auto)+q;
}
function updateGenerationModeUi(){
  const online=($('#generationMode')?.value||'online')==='online';
  const text=online?'✦ Generate Premium AI':'Generate Offline';
  if($('#generateBtn'))$('#generateBtn').textContent=text;
  if($('#generateBtn2'))$('#generateBtn2').textContent=text;
  ['aiModel','aiQuality','aiAccessCode'].forEach(id=>{if($('#'+id))$('#'+id).disabled=!online});
}
function setAiBusy(busy,title='AI sedang menyusun paket…',detail='Menganalisis TP, materi, level, dan bentuk soal.'){
  const p=$('#aiProgress');if(p)p.style.display=busy?'flex':'none';
  if($('#aiProgressTitle'))$('#aiProgressTitle').textContent=title;
  if($('#aiProgressText'))$('#aiProgressText').textContent=detail;
  ['generateBtn','generateBtn2'].forEach(id=>{const b=$('#'+id);if(b){b.disabled=busy;b.classList.toggle('ai-busy',busy)}});
}
function setAiStatus(state,text){
  const badge=$('#aiStatusBadge'),dot=$('#sidebarAiDot'),side=$('#sidebarAiText');
  if(badge){badge.className='ai-status-badge '+state;badge.textContent=text}
  if(dot){dot.classList.remove('error','checking');if(state==='error')dot.classList.add('error');if(state==='checking')dot.classList.add('checking')}
  if(side)side.textContent=text;
}
async function checkAiStatus(){
  setAiStatus('checking','Memeriksa backend…');
  try{
    const r=await fetch(`${AI_API_BASE}/api/health`,{cache:'no-store'});if(!r.ok)throw new Error('Backend tidak tersedia');
    const d=await r.json();
    if(d.gatewayConfigured)setAiStatus('ready',d.accessCodeRequired?'AI backend online • kode akses aktif':'AI backend online');
    else setAiStatus('error','Backend aktif • API key belum diatur');
  }catch(e){setAiStatus('error','Preview statis • backend belum aktif')}
}
function buildAiQuestionPlan(meta,count){
  const formats=assessmentPlan(count),materials=buildMaterialQuestionPlan(meta,count);
  return Array.from({length:count},(_,i)=>{
    const base=levelFor(i,count,meta.difficulty);
    return {no:i+1,materi:materials[i]||meta.topic,tp:meta.tps[i%meta.tps.length],level:taxonomyLevel(base,i,meta.taxonomy),baseLevel:base,format:formats[i]};
  });
}
function normalizeAiQuestions(rawQuestions,plan,meta){
  if(!Array.isArray(rawQuestions)||rawQuestions.length!==plan.length)throw new Error(`AI menghasilkan ${rawQuestions?.length||0} soal, seharusnya ${plan.length}.`);
  const byNo=new Map(rawQuestions.map(q=>[+q.no,q]));
  return plan.map((spec,i)=>{
    const raw=byNo.get(spec.no)||rawQuestions[i];if(!raw)throw new Error(`Soal nomor ${spec.no} tidak ditemukan.`);
    let options=Array.isArray(raw.options)?raw.options.map(x=>String(x).trim()).filter(Boolean):[];
    let answers=Array.isArray(raw.answers)?[...new Set(raw.answers.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<options.length))]:[];
    if(['PG','PGK-MCMA','PGK-Kategori'].includes(spec.format)){
      if(options.length!==meta.optionCount)throw new Error(`Soal ${spec.no}: jumlah opsi AI ${options.length}, seharusnya ${meta.optionCount}. Coba Generate ulang.`);
      if(spec.format==='PG'&&answers.length!==1)throw new Error(`Soal ${spec.no}: kunci PG tidak valid.`);
      if(spec.format==='PGK-MCMA'&&answers.length<2)throw new Error(`Soal ${spec.no}: PG kompleks harus memiliki lebih dari satu jawaban benar.`);
    }else{options=[];answers=[]}
    const q={
      id:crypto.randomUUID?.()||String(Date.now()+Math.random()),no:spec.no,topic:spec.materi,materi:spec.materi,tp:spec.tp,tpIndex:(i%meta.tps.length)+1,
      levelBase:spec.baseLevel,level:spec.level,format:spec.format,stimulus:String(raw.stimulus||'').trim(),question:String(raw.question||'').trim(),options,answers,
      answerText:String(raw.answerText||'').trim(),explanation:String(raw.explanation||'').trim(),comp:String(raw.comp||raw.indikator||'Kompetensi sesuai TP').trim(),
      indicator:String(raw.indikator||'').trim(),literacy:meta.questionMode==='literasi',teksBacaan:meta.questionMode==='literasi'?String(raw.stimulus||'').trim():'',poin:+raw.poin||undefined
    };
    if(!q.stimulus||!q.question||!q.explanation)throw new Error(`Soal ${spec.no}: output AI belum lengkap.`);
    q.indicator=q.indicator||buildIndicator(q,meta);q.bentuk=formatName(q.format);q.kunci=getKey(q);q.poin=getPoint(q);return q;
  });
}
async function generateOnline(meta,count){
  const plan=buildAiQuestionPlan(meta,count);const code=$('#aiAccessCode')?.value||'';
  setAiBusy(true,'AI sedang merancang paket premium…',meta.aiQuality==='max'?'Tahap 1: menyusun soal. Setelah itu model kedua akan mengaudit kualitas.':'Menyusun stimulus, soal, distraktor, kunci, dan pembahasan berdasarkan TP.');
  try{
    const headers={'Content-Type':'application/json'};if(code)headers['x-sanjara-key']=code;
    const r=await fetch(`${AI_API_BASE}/api/generate`,{method:'POST',headers,body:JSON.stringify({meta:{...meta,examTypeLabel:resolveExamTypeLabel(meta.examType,meta.examTypeCustom)},plan,contexts:contexts(),model:meta.aiModel,quality:meta.aiQuality})});
    let d={};try{d=await r.json()}catch{}
    if(!r.ok||!d.ok)throw new Error(d.error||`Server AI error ${r.status}`);
    currentQuestions=normalizeAiQuestions(d.questions,plan,meta);assessmentMeta={...meta,aiEngine:d.model||meta.aiModel,aiReviewEngine:d.reviewModel||'',aiQualityNotes:d.qualityNotes||[]};
    assessmentMeta.imagePrompts=buildImagePrompts(currentQuestions,meta);persistCurriculumDraft();renderAll();showView('preview');
    toast(meta.aiQuality==='max'?`${count} soal Premium Max selesai & diaudit AI kedua.`:`${count} soal premium selesai dibuat oleh ${d.model||'AI'}.`);
  }finally{setAiBusy(false)}
}
function buildImagePrompts(questions,meta){
  if(!meta.generateImagePrompts)return [];
  return questions.slice(0,Math.min(5,questions.length)).map(q=>({
    no:q.no,
    judul:`Ilustrasi ${q.materi||q.topic||meta.topic} — soal ${q.no}`,
    prompt:`Buat ilustrasi pendidikan untuk siswa SMP, gaya infografis sederhana dan realistis, tanpa jawaban dan tanpa teks panjang. Mata pelajaran ${meta.subjectName}, materi ${q.materi||q.topic||meta.topic}. Visual harus membantu memahami konteks soal berikut: ${(q.stimulus||'').replace(/\s+/g,' ').slice(0,260)}. Rasio 4:3, bersih, jelas, sesuai usia SMP.`
  }));
}
async function generate(){
  const count=Math.max(1,Math.min(50,+$('#count').value||20)),subject=$('#subject').value,diff=$('#difficulty').value;
  if(!$('#grade').value){$('#grade').focus();toast('Pilih kelas VII, VIII, atau IX terlebih dahulu');return}
  if(!$('#examType').value){$('#examType').focus();toast('Pilih jenis ujian / asesmen terlebih dahulu');return}
  const meta=captureAssessmentMeta();
  if(meta.materialScope==='single'&&!meta.topic){$('#customTopic').focus();toast('Isi Topik / Materi Spesifik terlebih dahulu');return}
  if(meta.materialScope==='multi'){
    meta.materials=(meta.materials||[]).filter(x=>x.name);
    if(!meta.materials.length){$('#materialRows .material-name')?.focus();toast('Isi minimal satu bab / materi semester');return}
    const distributed=meta.materials.reduce((a,b)=>a+(+b.count||0),0);
    if(distributed!==count){updateMaterialDistributionStatus();$('#materialRows .material-count')?.focus();toast(`Distribusi materi harus tepat ${count} soal. Saat ini ${distributed}.`);return}
    meta.materialSummary=`${meta.materials.length} bab: ${meta.materials.map(x=>x.name).join(' • ')}`;meta.topic=meta.materialSummary;
  }else meta.materialSummary=meta.topic;
  if(!meta.tps.length){$('#customTP').focus();toast('Isi minimal satu CP/TP atau indikator soal terlebih dahulu');return}
  if(meta.examType==='CUSTOM'&&!meta.examTypeCustom){$('#examTypeCustom').focus();toast('Isi nama jenis ujian custom terlebih dahulu');return}
  if(meta.mode==='official'&&!['tka_mix','pg'].includes(meta.assessmentType)){meta.assessmentType='tka_mix';$('#assessmentType').value='tka_mix';toast('Mode TKA resmi menggunakan pilihan ganda/PG kompleks.')}

  if(meta.generationMode==='online'){
    try{await generateOnline(meta,count)}catch(err){console.error(err);setAiBusy(false);toast(err.message||'Generate AI gagal. Periksa backend/API key.')}return;
  }

  const plan=assessmentPlan(count),materialPlan=buildMaterialQuestionPlan(meta,count),newQuestions=[];
  for(let i=0;i<count;i++){
    const material=materialPlan[i]||meta.topic,engineMaterial=engineTopic(material,subject),baseLevel=levelFor(i,count,diff),targetFormat=plan[i],builderFormat=['Isian','Uraian'].includes(targetFormat)?'PG':targetFormat;let q;
    if(subject==='math')q=buildMath(i,builderFormat,baseLevel,engineMaterial);else if(subject==='indo')q=buildIndo(i,builderFormat,baseLevel,engineMaterial);else q=buildGeneric(subject,i,builderFormat,baseLevel,engineMaterial);
    q.topic=material;q.materi=material;q.no=i+1;q.tp=meta.tps[i%meta.tps.length];q.tpIndex=(i%meta.tps.length)+1;q.levelBase=baseLevel;q.level=taxonomyLevel(baseLevel,i,meta.taxonomy);q.indicator=buildIndicator(q,meta);ensurePgOptionCount(q,meta.optionCount);q=convertQuestionFormat(q,targetFormat);q=applyQuestionMode(q,meta);q.bentuk=formatName(q.format);q.kunci=getKey(q);q.poin=getPoint(q);newQuestions.push(q);
  }
  currentQuestions=newQuestions;assessmentMeta={...meta,aiEngine:'Offline Template'};assessmentMeta.imagePrompts=buildImagePrompts(currentQuestions,meta);persistCurriculumDraft();renderAll();showView('preview');toast(`${count} soal dibuat dengan mode offline.`);
}
function renderQuestion(q,i){
  const letters='ABCDE';let opts='';
  if(q.format==='PGK-Kategori'){
    opts=`<table class="category-table premium-category"><thead><tr><th>Pernyataan</th><th>Benar</th><th>Salah</th></tr></thead><tbody>${q.options.map((o,j)=>`<tr><td><span class="option-letter inline">${letters[j]}</span>${escapeHtml(o)}</td><td>□</td><td>□</td></tr>`).join('')}</tbody></table>`;
  }else if(q.format==='PG'||q.format==='PGK-MCMA'){
    opts=`<div class="options premium-options">${q.options.map((o,j)=>`<div class="option"><span class="option-letter">${letters[j]}</span><span contenteditable="true">${escapeHtml(o)}</span></div>`).join('')}</div>`;
  }else if(q.format==='Isian'){
    opts='<div class="short-answer-box premium-answer"><b>Jawaban</b><span></span></div>';
  }else if(q.format==='Uraian'){
    opts='<div class="essay-answer-box premium-essay"><span></span><span></span><span></span><span></span></div>';
  }
  const literacy=q.literacy?'<span class="tag blue">Literasi</span>':'';
  return `<article class="question-card premium-question-card" data-id="${q.id}">
    <div class="question-card-top">
      <div class="question-no-badge"><span>SOAL</span><strong>${i+1}</strong></div>
      <div class="question-head-info">
        <div class="question-meta"><span class="tag">${formatName(q.format)}</span><span class="tag">${escapeHtml(q.level)}</span>${literacy}<span class="tag material-tag">${escapeHtml(q.topic)}</span></div>
        ${q.tp?`<div class="tp-preview premium-tp"><b>Tujuan Pembelajaran</b><span>${escapeHtml(q.tp)}</span></div>`:''}
      </div>
      <div class="edit-row"><button class="edit-btn" onclick="duplicateQuestion('${q.id}')" title="Duplikasi soal">⧉</button></div>
    </div>
    <div class="question-content">
      <div class="stimulus premium-stimulus"><span class="content-kicker">STIMULUS</span><div contenteditable="true">${escapeHtml(q.stimulus)}</div></div>
      <div class="question-text premium-question-text"><span class="content-kicker">PERTANYAAN</span><div contenteditable="true">${escapeHtml(q.question)}</div></div>
      ${opts}
      <div class="answer-box premium-key"><b>Kunci/Kriteria:</b> ${escapeHtml(getKey(q))}<br><b>Pembahasan:</b> ${escapeHtml(q.explanation||q.answerText||'')}<br><b>Poin:</b> ${getPoint(q)}</div>
    </div>
  </article>`;
}
function blueprintRowsHtml(){
  return currentQuestions.map((q,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(q.tp||'—')}</td><td>${escapeHtml(q.materi||q.topic)}</td><td>${escapeHtml(q.indicator||q.comp)}</td><td>${escapeHtml(q.level)}</td><td>${escapeHtml(formatName(q.format))}</td><td>${escapeHtml(getKey(q))}</td></tr>`).join('');
}
function renderCard(q,i){
  const letters='ABCDE';
  let rumusan=`<div class="card-stimulus">${escapeHtml(q.stimulus)}</div><div class="card-question">${escapeHtml(q.question)}</div>`;
  if(q.options?.length){rumusan+=`<div class="card-options">${q.options.map((o,j)=>`<div>${letters[j]}. ${escapeHtml(o)}</div>`).join('')}</div>`}
  const examLabel=resolveExamTypeLabel(assessmentMeta?.examType||$('#examType').value,assessmentMeta?.examTypeCustom||$('#examTypeCustom').value);
  return `<article class="exam-card"><div class="exam-card-head"><div><b>Mata Pelajaran</b><span>${escapeHtml(assessmentMeta?.subjectName||subjectName())}</span></div><div><b>Kelas/Semester</b><span>${escapeHtml(assessmentMeta?.grade||$('#grade').value)} / ${escapeHtml(assessmentMeta?.semester||$('#semester').value)}</span></div><div class="exam-kind"><b>Jenis Ujian</b><span>${escapeHtml(examLabel)}</span></div></div><table><tr><td class="wide"><b>Tujuan Pembelajaran</b><br>${escapeHtml(q.tp||'—')}</td><td class="center"><b>Nomor Soal</b><br><strong class="big-no">${i+1}</strong></td><td class="center"><b>Kunci/Kriteria</b><br>${escapeHtml(getKey(q))}</td></tr></table><div class="exam-card-body"><b>Rumusan Soal</b>${rumusan}</div><table><tr><td><b>Materi</b><br>${escapeHtml(q.materi||q.topic)}</td><td><b>Indikator Soal</b><br>${escapeHtml(q.indicator||q.comp)}</td><td><b>Level Kognitif</b><br>${escapeHtml(q.level)}</td></tr></table></article>`;
}
function renderCardsHtml(){return currentQuestions.map(renderCard).join('')}
function petunjukPengerjaanHtml(){
  const formats=new Set(currentQuestions.map(q=>q.format));
  const items=['Berdoalah terlebih dahulu sebelum mengerjakan soal.','Tuliskan nama, kelas, dan identitas pada lembar jawaban.','Bacalah setiap stimulus dan pertanyaan dengan cermat.'];
  if(formats.has('PG'))items.push('Untuk pilihan ganda, pilih satu jawaban yang paling tepat.');
  if(formats.has('PGK-MCMA'))items.push('Untuk PG kompleks MCMA, pilih semua pernyataan yang benar.');
  if(formats.has('PGK-Kategori'))items.push('Untuk PG kompleks kategori, tentukan Benar atau Salah pada setiap pernyataan.');
  if(formats.has('Isian'))items.push('Untuk isian singkat, tuliskan jawaban ringkas dan tepat.');
  if(formats.has('Uraian'))items.push('Untuk uraian, tuliskan jawaban lengkap, runtut, dan sertakan alasan/langkah penyelesaian.');
  items.push('Periksa kembali seluruh jawaban sebelum dikumpulkan.');
  return `<section class="doc-block"><h3>Petunjuk Pengerjaan</h3><ol>${items.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol></section>`;
}
function studentIdentityHtml(){
  return `<div class="student-identity"><div><span>Nama Peserta</span><b>....................................................................</b></div><div><span>Kelas</span><b>....................</b></div><div><span>No. Peserta</span><b>....................</b></div><div><span>Tanggal</span><b>....................</b></div></div>`;
}
function naskahSoalHtml(){
  const letters='ABCDE';
  const questions=currentQuestions.map((q,i)=>{
    let answer='';
    if(q.format==='PG'||q.format==='PGK-MCMA'){
      answer=`<div class="doc-options premium-doc-options">${q.options.map((o,j)=>`<div class="doc-option"><span>${letters[j]}</span><p>${escapeHtml(o)}</p></div>`).join('')}</div>`;
    }else if(q.format==='PGK-Kategori'){
      answer=`<table class="doc-table doc-category"><thead><tr><th>Pernyataan</th><th>Benar</th><th>Salah</th></tr></thead><tbody>${q.options.map((o,j)=>`<tr><td><b>${letters[j]}.</b> ${escapeHtml(o)}</td><td class="center">□</td><td class="center">□</td></tr>`).join('')}</tbody></table>`;
    }else if(q.format==='Isian'){
      answer='<div class="doc-answer-line"><span>Jawaban:</span><div></div></div>';
    }else{
      answer='<div class="doc-essay-lines"><span></span><span></span><span></span><span></span></div>';
    }
    return `<article class="doc-question premium-doc-question"><div class="doc-number">${i+1}</div><div class="doc-question-body"><div class="doc-stimulus"><span class="doc-label">STIMULUS</span><p>${escapeHtml(q.stimulus)}</p></div><div class="doc-prompt"><span class="doc-label">PERTANYAAN</span><p>${escapeHtml(q.question)}</p></div>${answer}</div></article>`;
  }).join('');
  return `<section class="doc-block naskah-section"><div class="doc-section-title"><span>NASKAH SOAL</span><small>Bacalah setiap stimulus dan pertanyaan dengan teliti sebelum menjawab.</small></div>${studentIdentityHtml()}<div class="questions-paper">${questions}</div></section>`;
}
function keyTableHtml(){
  return `<section class="doc-block"><h2>KUNCI JAWABAN</h2><table class="doc-table"><thead><tr><th>No</th><th>Bentuk Soal</th><th>Kunci Jawaban / Kriteria</th><th>Poin</th></tr></thead><tbody>${currentQuestions.map((q,i)=>`<tr><td class="center">${i+1}</td><td>${escapeHtml(formatName(q.format))}</td><td>${escapeHtml(getKey(q))}</td><td class="center">${getPoint(q)}</td></tr>`).join('')}</tbody></table></section>`;
}
function pembahasanHtml(){
  if(!currentQuestions.length)return '';
  return `<section class="doc-block"><h2>PEMBAHASAN SINGKAT</h2><table class="doc-table"><thead><tr><th>No</th><th>Pembahasan / Jawaban Inti</th></tr></thead><tbody>${currentQuestions.map((q,i)=>`<tr><td class="center">${i+1}</td><td>${escapeHtml(q.explanation||q.answerText||getKey(q))}</td></tr>`).join('')}</tbody></table></section>`;
}
function scoringRubricHtml(){
  if(!currentQuestions.length)return '';
  const groups={PG:[],complex:[],Isian:[],Uraian:[]};
  currentQuestions.forEach(q=>{if(q.format==='PG')groups.PG.push(q);else if(q.format.startsWith('PGK'))groups.complex.push(q);else if(q.format==='Isian')groups.Isian.push(q);else if(q.format==='Uraian')groups.Uraian.push(q)});
  let html='<section class="doc-block"><h2>PEDOMAN PENSKORAN</h2>';
  if(groups.PG.length)html+=`<h4>A. Pilihan Ganda</h4><table class="doc-table"><tr><th>Ketentuan</th><th>Poin</th></tr><tr><td>Jawaban benar</td><td class="center">1</td></tr><tr><td>Jawaban salah/kosong</td><td class="center">0</td></tr></table>`;
  if(groups.complex.length)html+=`<h4>B. PG Kompleks</h4><table class="doc-table"><tr><th>Ketentuan</th><th>Poin Maks.</th></tr><tr><td>Seluruh pilihan/kategori tepat</td><td class="center">2</td></tr><tr><td>Sebagian tepat</td><td class="center">1</td></tr><tr><td>Tidak tepat/kosong</td><td class="center">0</td></tr></table>`;
  if(groups.Isian.length)html+=`<h4>C. Isian Singkat</h4><table class="doc-table"><tr><th>No</th><th>Jawaban yang Diterima</th><th>Poin</th></tr>${groups.Isian.map(q=>`<tr><td class="center">${q.no}</td><td>${escapeHtml(q.answerText||'')}</td><td class="center">${getPoint(q)}</td></tr>`).join('')}</table>`;
  if(groups.Uraian.length){html+='<h4>D. Uraian</h4>';groups.Uraian.forEach(q=>{const max=getPoint(q);const hot=/C4|C5|C6|Penalaran|Relational|Extended/i.test(q.level||'');const desc=hot?'Analisis/argumentasi tepat, logis, dan didukung bukti dari stimulus.':'Jawaban tepat, lengkap, runtut, dan sesuai konsep.';html+=`<p><b>No. ${q.no}</b> — ${escapeHtml(q.indicator||q.tp||'')} (maks. ${max} poin)</p><table class="doc-table"><tr><th>Kualitas</th><th>Deskripsi</th><th>Poin</th></tr><tr><td>Sangat Baik</td><td>${escapeHtml(desc)}</td><td class="center">${max}</td></tr><tr><td>Baik</td><td>Sebagian besar tepat, terdapat kekurangan kecil.</td><td class="center">${Math.round(max*.75)}</td></tr><tr><td>Cukup</td><td>Memahami inti masalah tetapi jawaban belum lengkap.</td><td class="center">${Math.round(max*.5)}</td></tr><tr><td>Kurang</td><td>Jawaban sangat terbatas atau kurang relevan.</td><td class="center">${Math.round(max*.25)}</td></tr><tr><td>Tidak Dijawab</td><td>Tidak ada respons bermakna.</td><td class="center">0</td></tr></table>`})}
  const total=currentQuestions.reduce((s,q)=>s+getPoint(q),0);
  html+=`<div class="score-summary"><b>Total Poin Maksimal: ${total}</b><br>Nilai Akhir = (Poin Diperoleh ÷ ${total}) × 100</div></section>`;
  return html;
}
function promptGambarHtml(){
  const prompts=assessmentMeta?.imagePrompts||[];if(!prompts.length)return '';
  return `<section class="doc-block"><h2>PROMPT GAMBAR</h2><p class="muted">Prompt siap disalin ke generator gambar.</p>${prompts.map(p=>`<div class="prompt-card"><b>${p.no}. ${escapeHtml(p.judul)}</b><p>${escapeHtml(p.prompt)}</p></div>`).join('')}</section>`;
}
function blueprintDocumentHtml(){
  const examLabel=resolveExamTypeLabel(assessmentMeta?.examType||$('#examType').value,assessmentMeta?.examTypeCustom||$('#examTypeCustom').value);
  return `<section class="doc-block"><h2>KISI-KISI PENULISAN SOAL</h2><p><b>Jenis Ujian:</b> ${escapeHtml(examLabel)}<br><b>Mata Pelajaran:</b> ${escapeHtml(assessmentMeta?.subjectName||subjectName())}<br><b>Kelas/Semester:</b> ${escapeHtml(assessmentMeta?.grade||$('#grade').value)} / ${escapeHtml(assessmentMeta?.semester||$('#semester').value)}</p><table class="doc-table"><thead><tr><th>No</th><th>Tujuan Pembelajaran</th><th>Materi</th><th>Indikator Soal</th><th>Level Kognitif</th><th>Bentuk Soal</th></tr></thead><tbody>${currentQuestions.map((q,i)=>`<tr><td class="center">${i+1}</td><td>${escapeHtml(q.tp||'')}</td><td>${escapeHtml(q.materi||q.topic)}</td><td>${escapeHtml(q.indicator||q.comp)}</td><td>${escapeHtml(q.level)}</td><td>${escapeHtml(formatName(q.format))}</td></tr>`).join('')}</tbody></table></section>`;
}
function fullDocumentHtml(includeCards=true,forWord=false){
  const cards=includeCards?`<section class="doc-block"><h2>KARTU SOAL</h2>${renderCardsHtml()}</section>`:'';
  return `${headerHtml(forWord)}${blueprintDocumentHtml()}${cards}${petunjukPengerjaanHtml()}${naskahSoalHtml()}${keyTableHtml()}${pembahasanHtml()}${scoringRubricHtml()}${promptGambarHtml()}`;
}
function renderAll(){
  if(currentQuestions.length){
    $('#questionList').className='question-list'+(showKeys?' show-keys':'');
    $('#questionList').innerHTML=headerHtml()+petunjukPengerjaanHtml()+currentQuestions.map(renderQuestion).join('');
  }else{
    $('#questionList').className='question-list empty-state';
    $('#questionList').innerHTML='<div class="empty-icon">✦</div><h3>Belum ada soal</h3><p>Kembali ke Generator Soal lalu klik <b>Generate Soal</b>.</p>';
  }
  if(currentQuestions.length){
    const pkgExam=resolveExamTypeLabel(assessmentMeta?.examType||$('#examType').value,assessmentMeta?.examTypeCustom||$('#examTypeCustom').value);
    $('#packageTitle').textContent=`${pkgExam} • ${assessmentMeta?.subjectName||subjectName()} • Kelas ${assessmentMeta?.grade||$('#grade').value} • ${currentQuestions.length} Soal`;
  }else{
    $('#packageTitle').textContent='Belum ada paket aktif';
  }
  renderActivePackageMeta();
  const pg=currentQuestions.filter(q=>q.format==='PG').length,complex=currentQuestions.filter(q=>q.format.startsWith('PGK')).length,nonPg=currentQuestions.filter(q=>['Isian','Uraian'].includes(q.format)).length;
  const vals=$$('#stats strong');[currentQuestions.length,pg,complex,nonPg].forEach((v,i)=>{if(vals[i])vals[i].textContent=v});
  $('#blueprintBody').innerHTML=currentQuestions.length?blueprintRowsHtml():'<tr><td colspan="7" class="muted center">Belum ada data.</td></tr>';
  $('#cardsList').className=currentQuestions.length?'cards-list':'cards-list empty-state';
  $('#cardsList').innerHTML=currentQuestions.length?renderCardsHtml():'<div class="empty-icon">▦</div><h3>Belum ada kartu soal</h3><p>Generate paket terlebih dahulu.</p>';
  $('#scoringContent').className=currentQuestions.length?'document-section':'document-section empty-state';
  $('#scoringContent').innerHTML=currentQuestions.length?keyTableHtml()+pembahasanHtml()+scoringRubricHtml()+promptGambarHtml():'<div class="empty-icon">✓</div><h3>Belum ada pedoman</h3><p>Generate paket terlebih dahulu.</p>';
  renderBank();
}

function duplicateQuestion(id){const idx=currentQuestions.findIndex(q=>q.id===id);if(idx<0)return;const clone=structuredClone(currentQuestions[idx]);clone.id=crypto.randomUUID?.()||String(Date.now()+Math.random());currentQuestions.splice(idx+1,0,clone);currentQuestions.forEach((q,i)=>q.no=i+1);if(assessmentMeta)assessmentMeta.imagePrompts=buildImagePrompts(currentQuestions,assessmentMeta);renderAll();toast('Soal diduplikasi')}

function showView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===id));if(id==='preview'){renderPackagePicker();renderActivePackageMeta()}}
function getBankPackages(){
  try{return JSON.parse(localStorage.getItem('tkaBank')||'[]')}catch{return []}
}
function renderPackagePicker(){
  const picker=$('#packagePicker'); if(!picker)return;
  const bank=getBankPackages();
  picker.innerHTML=bank.length
    ? '<option value="">-- Pilih paket tersimpan --</option>'+bank.map((p,i)=>`<option value="${i}">${escapeHtml(p.title||`Paket ${i+1}`)} • ${p.questions?.length||0} soal</option>`).join('')
    : '<option value="">Belum ada paket tersimpan</option>';
}
function renderActivePackageMeta(){
  const box=$('#activePackageMeta'); if(!box)return;
  if(!currentQuestions.length){box.style.display='none';box.innerHTML='';return}
  const meta=assessmentMeta||captureAssessmentMeta();
  const exam=resolveExamTypeLabel(meta.examType,meta.examTypeCustom);
  const engine=meta.aiEngine||((meta.generationMode||'online')==='online'?'AI Online Premium':'Offline Template');
  const engineLabel=meta.aiReviewEngine?`${engine} + audit ${meta.aiReviewEngine}`:engine;
  const cells=[['Jenis Ujian',exam],['Mapel',meta.subjectName||subjectName()],['Kelas',meta.grade||$('#grade').value],['Semester',meta.semester||$('#semester').value],['Soal',currentQuestions.length],['Mesin Generate',engineLabel]];
  box.innerHTML=cells.map(([k,v])=>`<span><b>${escapeHtml(k)}:</b> ${escapeHtml(v||'-')}</span>`).join('');
  box.style.display='flex';
}
function openSelectedPackage(){
  const picker=$('#packagePicker');
  if(!picker||picker.value===''){toast('Pilih paket yang ingin dibuka');return}
  loadBank(parseInt(picker.value,10));
}
function startNewPackage(){
  currentQuestions=[]; assessmentMeta=null; showKeys=false; renderAll(); showView('generator');
  toast('Silakan pilih mapel, kelas, dan jenis ujian untuk paket baru');
}

function saveBank(){if(!currentQuestions.length)return toast('Generate soal terlebih dahulu');const bank=JSON.parse(localStorage.getItem('tkaBank')||'[]');bank.unshift({id:Date.now(),title:`${resolveExamTypeLabel(assessmentMeta?.examType||$('#examType').value,assessmentMeta?.examTypeCustom||$('#examTypeCustom').value)} • ${assessmentMeta?.subjectName || subjectName()} Kelas ${assessmentMeta?.grade || $('#grade').value}`,date:new Date().toLocaleString('id-ID'),questions:currentQuestions,kopConfig,assessmentMeta});localStorage.setItem('tkaBank',JSON.stringify(bank.slice(0,20)));renderBank();toast('Paket disimpan ke bank')}
function renderBank(){const bank=getBankPackages();$('#bankList').innerHTML=bank.length?bank.map((p,i)=>`<div class="bank-item"><div><strong>${p.title}</strong><span>${p.questions.length} soal • ${p.date}</span></div><div class="action-row"><button class="btn secondary" onclick="loadBank(${i})">Buka</button><button class="btn danger" onclick="deleteBank(${i})">Hapus</button></div></div>`).join(''):'<div class="empty-state"><div class="empty-icon">◫</div><h3>Bank soal kosong</h3><p>Simpan paket yang sudah dibuat agar dapat digunakan kembali.</p></div>';renderPackagePicker()}
function loadBank(i){const bank=JSON.parse(localStorage.getItem('tkaBank')||'[]');currentQuestions=bank[i]?.questions||[];assessmentMeta=bank[i]?.assessmentMeta||null;if(assessmentMeta)applyAssessmentMeta(assessmentMeta);if(bank[i]?.kopConfig){kopConfig=bank[i].kopConfig;persistKopConfig();updateKopPreview()}renderAll();showView('preview');toast('Paket dimuat')}
function deleteBank(i){const bank=JSON.parse(localStorage.getItem('tkaBank')||'[]');bank.splice(i,1);localStorage.setItem('tkaBank',JSON.stringify(bank));renderBank();}

function download(name,content,type){
  const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),800);
}
function exportJson(){
  const data={meta:{school:'SMP SSA Negeri Jenggrong Ranuyoso',subject:assessmentMeta?.subjectName||subjectName(),grade:assessmentMeta?.grade||$('#grade').value,semester:assessmentMeta?.semester||$('#semester').value,phase:assessmentMeta?.phase||$('#phase').value,examType:resolveExamTypeLabel(assessmentMeta?.examType||$('#examType').value,assessmentMeta?.examTypeCustom||$('#examTypeCustom').value),created:new Date().toISOString()},kopConfig,assessmentMeta,questions:currentQuestions,bank:JSON.parse(localStorage.getItem('tkaBank')||'[]')};
  download('bank-soal-tka.json',JSON.stringify(data,null,2),'application/json');
}
function exportCsv(){
  if(!currentQuestions.length)return toast('Belum ada data');
  const rows=[['No','Tujuan Pembelajaran (TP)','Materi','Indikator Soal','Level Kognitif','Bentuk Soal','Kunci/Kriteria','Poin']];
  currentQuestions.forEach((q,i)=>rows.push([i+1,q.tp||'',q.materi||q.topic,q.indicator||q.comp,q.level,formatName(q.format),getKey(q),getPoint(q)]));
  download('kisi-kisi-tka.csv','\ufeff'+rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n'),'text/csv;charset=utf-8');
}
function documentCss(){
  return `
  @page{size:A4;margin:13mm 14mm 15mm}
  *{box-sizing:border-box}
  body{font-family:Aptos,Calibri,Arial,sans-serif;font-size:10.8pt;color:#17202b;margin:0;padding:0;background:#fff;line-height:1.5}
  h2{text-align:center;font-size:15pt;letter-spacing:.04em;margin:24px 0 12px;color:#132f2d}
  h3{font-size:12.5pt;margin:14px 0 8px;color:#173d3a} h4{font-size:10.8pt;margin:12px 0 6px;color:#173d3a}
  .print-sheet-head{margin-bottom:16px}.kop-sheet img{width:100%;height:auto;display:block}
  .exam-meta{border:1px solid #9aa6b2;border-radius:5px;padding:10px 12px;margin-top:8px;background:#fff}
  .exam-meta h3{text-align:center;margin:0 0 9px;font-size:14pt;letter-spacing:.05em;text-transform:uppercase;color:#122c2a}
  .exam-meta-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0;border-top:1px solid #d7dde3;border-left:1px solid #d7dde3}
  .exam-meta-grid>div{padding:5px 8px;border-right:1px solid #d7dde3;border-bottom:1px solid #d7dde3;min-height:42px}
  .exam-meta-grid span{font-size:8.5pt;color:#667085;display:block;text-transform:uppercase;letter-spacing:.04em}
  .exam-meta-grid strong{display:block;margin-top:2px;font-size:10pt;color:#17202b}
  .exam-tp-list{margin-top:8px;border-top:1px solid #d7dde3;padding-top:7px;font-size:9.5pt}.exam-tp-list ol{margin:5px 0 0;padding-left:20px}
  .doc-block{margin-top:24px;page-break-inside:auto}.doc-block>h2{border-bottom:2px solid #173d3a;padding-bottom:6px}
  .doc-block>h3{border-left:4px solid #173d3a;padding-left:8px}.doc-block ol{padding-left:22px;line-height:1.65}
  .doc-table,.exam-card table{width:100%;border-collapse:collapse}.doc-table th,.doc-table td,.exam-card td{border:1px solid #aab2bb;padding:5px 6px;vertical-align:top}
  .doc-table th{background:#edf1f4;color:#26333f;font-weight:700}.center{text-align:center}
  .doc-section-title{text-align:center;border-top:3px solid #173d3a;border-bottom:1px solid #9aa6b2;padding:9px 0 8px;margin:0 0 12px}
  .doc-section-title span{display:block;font-size:15pt;font-weight:800;letter-spacing:.12em;color:#132f2d}.doc-section-title small{display:block;font-size:8.8pt;color:#667085;margin-top:3px;letter-spacing:.01em}
  .student-identity{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;border:1px solid #b8c0c8;margin-bottom:14px;background:#fbfcfd}
  .student-identity>div{padding:6px 8px;border-right:1px solid #cbd2d9;min-height:44px}.student-identity>div:last-child{border-right:0}
  .student-identity span{display:block;font-size:8pt;text-transform:uppercase;letter-spacing:.05em;color:#667085}.student-identity b{display:block;font-weight:500;margin-top:3px;color:#394552}
  .questions-paper{counter-reset:q}
  .premium-doc-question{display:grid;grid-template-columns:34px 1fr;gap:8px;margin:0;padding:12px 0 14px;border-bottom:1px solid #d8dde3;page-break-inside:avoid}
  .premium-doc-question:last-child{border-bottom:0}.doc-number{width:27px;height:27px;border:1.5px solid #173d3a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10pt;font-weight:800;color:#173d3a;margin-top:2px}
  .doc-question-body{min-width:0}.doc-label{display:inline-block;font-size:7.6pt;font-weight:800;letter-spacing:.09em;color:#51606d;margin-bottom:3px}
  .doc-stimulus{background:#f5f7f8;border-left:3px solid #5f8c86;padding:8px 10px;margin:0 0 8px;border-radius:2px}.doc-stimulus p{margin:0;white-space:pre-line;text-align:justify}
  .doc-prompt{padding:1px 1px 0}.doc-prompt p{margin:1px 0 7px;font-weight:700;line-height:1.5}
  .premium-doc-options{margin:7px 0 0;display:grid;grid-template-columns:1fr 1fr;gap:5px 14px}.doc-option{display:grid;grid-template-columns:22px 1fr;gap:6px;align-items:start;min-height:28px}.doc-option>span{width:20px;height:20px;border:1px solid #75818d;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8.5pt;font-weight:700}.doc-option p{margin:1px 0 0;line-height:1.4}
  .doc-category{margin-top:8px;font-size:9.5pt}.doc-category th:nth-child(2),.doc-category th:nth-child(3),.doc-category td:nth-child(2),.doc-category td:nth-child(3){width:58px;text-align:center}
  .doc-answer-line{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:end;margin-top:10px}.doc-answer-line span{font-weight:700}.doc-answer-line div{border-bottom:1px dotted #5d6874;height:22px}
  .doc-essay-lines{display:grid;gap:11px;margin-top:10px}.doc-essay-lines span{height:18px;border-bottom:1px dotted #7b8490}
  .exam-card{border:1px solid #87919b;margin:0 0 14px;page-break-inside:avoid;border-radius:3px;overflow:hidden}.exam-card-head{display:grid;grid-template-columns:1fr 1fr;background:#eef2f3;border-bottom:1px solid #9aa3ad}.exam-card-head>div{padding:6px 9px}.exam-card-head>div+div{border-left:1px solid #aab2bb}.exam-card-head span{display:block}.exam-card-head .exam-kind{grid-column:1/-1;border-top:1px solid #aab2bb}.exam-card-body{padding:8px 10px}.card-stimulus{margin:5px 0 7px;background:#f7f9fa;border-left:3px solid #739b95;padding:6px 8px}.card-question{font-weight:bold}.card-options{display:grid;grid-template-columns:1fr 1fr;gap:3px 14px;margin-top:6px}.exam-card .wide{width:55%}.big-no{font-size:16pt}
  .score-summary{margin-top:12px;padding:9px;border:1px solid #aab2bb;background:#f7f9fa;border-radius:3px}.prompt-card{border:1px solid #b8c0c8;padding:8px;margin:8px 0;background:#fafbfc}.muted{color:#667085}.print-note{display:none}
  @media(max-width:700px){.student-identity{grid-template-columns:1fr 1fr}.student-identity>div{border-bottom:1px solid #cbd2d9}.premium-doc-options,.card-options{grid-template-columns:1fr}}
  @media print{body{padding:0}.doc-block{break-inside:auto}.exam-card,.premium-doc-question{break-inside:avoid}.naskah-section{page-break-before:always}.naskah-section:first-child{page-break-before:auto}}
  `;
}
function documentShell(content,title='SANJARA TKA — Paket Ujian'){
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>${documentCss()}</style></head><body>${content}</body></html>`;
}
function exportWord(){
  if(!currentQuestions.length)return toast('Belum ada soal');
  const content=fullDocumentHtml(true,true);
  const html=documentShell(content,'Paket Ujian SANJARA TKA');
  const safe=(assessmentMeta?.subjectName||subjectName()||'Mapel').replace(/[^A-Za-z0-9]+/g,'_');
  const examSafe=resolveExamTypeLabel(assessmentMeta?.examType||$('#examType').value,assessmentMeta?.examTypeCustom||$('#examTypeCustom').value).replace(/[^A-Za-z0-9]+/g,'_');
  download(`Naskah_Soal_${examSafe}_${safe}.doc`,'\ufeff'+html,'application/msword');
}
function copyHtmlText(html,success='Berhasil disalin'){
  const temp=document.createElement('div');temp.style.cssText='position:fixed;left:-9999px;top:0;white-space:pre-wrap';temp.innerHTML=html;document.body.appendChild(temp);
  const text=(temp.innerText||temp.textContent||'').replace(/\n{3,}/g,'\n\n').trim();temp.remove();
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>toast(success)).catch(()=>fallbackCopy(text,success));else fallbackCopy(text,success);
}
function fallbackCopy(text,success){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast(success)}catch{toast('Gagal menyalin')}ta.remove()}
function printHtml(content,title){
  const w=window.open('','_blank');if(!w){toast('Popup diblokir. Izinkan popup untuk mencetak.');return}
  w.document.open();w.document.write(documentShell(content,title));w.document.close();
  setTimeout(()=>{w.focus();w.print()},450);
}
function printFullDocument(){if(!currentQuestions.length)return toast('Belum ada soal');printHtml(fullDocumentHtml(true,false),'Paket Ujian SANJARA TKA')}
function printCards(){if(!currentQuestions.length)return toast('Belum ada kartu soal');printHtml(`${headerHtml()}<section class="doc-block"><h2>KARTU SOAL</h2>${renderCardsHtml()}</section>`,'Kartu Soal SANJARA TKA')}

$('#generationMode')?.addEventListener('change',()=>{updateGenerationModeUi();persistCurriculumDraft()});
$('#aiModel')?.addEventListener('change',()=>{updateAiModelNote();persistCurriculumDraft()});
$('#aiQuality')?.addEventListener('change',()=>{updateAiModelNote();persistCurriculumDraft()});
$('#mode').addEventListener('change',()=>{setSubjects(true);updateAssessmentTypeOptions();persistCurriculumDraft()});
$('#subject').addEventListener('change',()=>setTopics(true));
$('#grade').addEventListener('change',()=>{$('#phase').value='Fase D';persistCurriculumDraft()});
$('#semester').addEventListener('change',persistCurriculumDraft);
$('#examType').addEventListener('change',()=>{updateExamTypeControls(true);persistCurriculumDraft()});
$('#examTypeCustom').addEventListener('input',persistCurriculumDraft);
$('#materialScope').addEventListener('change',()=>{updateMaterialScopeControls(true);if($('#materialScope').value==='multi')autoDistributeMaterials(false);persistCurriculumDraft()});
$('#addMaterialBtn').addEventListener('click',()=>{addMaterialRow();persistCurriculumDraft()});
$('#autoDistributeBtn').addEventListener('click',()=>autoDistributeMaterials(true));
$('#count').addEventListener('input',updateMaterialDistributionStatus);
$('#topic').addEventListener('change',()=>{const v=$('#topic').value;if(v&&v!=='__custom__')$('#customTopic').value=v;else if(v==='__custom__')$('#customTopic').value='';if($('#materialScope').value!=='multi')updateCustomTopicInput(v==='__custom__');persistCurriculumDraft()});
$('#customTopic').addEventListener('input',persistCurriculumDraft);
$('#customTP').addEventListener('input',persistCurriculumDraft);
$('#questionMode').addEventListener('change',persistCurriculumDraft);
$('#assessmentType').addEventListener('change',()=>{updateAssessmentControls();persistCurriculumDraft()});
$('#taxonomy').addEventListener('change',()=>{updateAssessmentControls();persistCurriculumDraft()});
$('#optionCount').addEventListener('change',persistCurriculumDraft);
$('#generateImagePrompts').addEventListener('change',persistCurriculumDraft);
$('#difficulty').addEventListener('change',persistCurriculumDraft);
$('#printTP').addEventListener('change',()=>{persistCurriculumDraft();if(assessmentMeta){assessmentMeta.printTP=$('#printTP').checked;renderAll()}});
$('#kopMode').addEventListener('change',e=>{kopConfig.mode=e.target.value;persistKopConfig();updateKopPreview()});
$('#kopUpload').addEventListener('change',e=>handleKopUpload(e.target.files[0]));
$('#resetKopBtn').onclick=()=>{kopConfig={mode:'default',customDataUrl:''};persistKopConfig();updateKopPreview();toast('Kop dikembalikan ke default')};
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
$$('#contextChips .chip').forEach(c=>c.addEventListener('click',()=>c.classList.toggle('selected')));
['mixPg','mixMcma','mixCat'].forEach(id=>$('#'+id).addEventListener('input',e=>{$('#'+id+'Val').textContent=e.target.value+'%';persistCurriculumDraft()}));
$('#generateBtn').onclick=generate;$('#generateBtn2').onclick=generate;$('#saveBankBtn').onclick=saveBank;
if($('#openPackageBtn'))$('#openPackageBtn').onclick=openSelectedPackage;
if($('#newPackageBtn'))$('#newPackageBtn').onclick=startNewPackage;
if($('#packagePicker'))$('#packagePicker').addEventListener('change',e=>{if(e.target.value!=='')openSelectedPackage()});
$('#toggleKeyBtn').onclick=()=>{showKeys=!showKeys;$('#questionList').classList.toggle('show-keys',showKeys);$('#toggleKeyBtn').textContent=showKeys?'Sembunyikan Kunci':'Tampilkan Kunci'};
$('#copyResultBtn').onclick=()=>{if(!currentQuestions.length)return toast('Belum ada soal');copyHtmlText(headerHtml()+petunjukPengerjaanHtml()+naskahSoalHtml(),'Naskah soal disalin')};
$('#printBtn').onclick=printFullDocument;
$('#printCardsBtn').onclick=printCards;
$('#copyScoringBtn').onclick=()=>{if(!currentQuestions.length)return toast('Belum ada pedoman');copyHtmlText(keyTableHtml()+pembahasanHtml()+scoringRubricHtml()+promptGambarHtml(),'Pedoman skor disalin')};
$('#exportWordBtn').onclick=exportWord;$('#exportCsvBtn').onclick=exportCsv;$('#exportJsonBtn').onclick=exportJson;
$('#clearBankBtn').onclick=()=>{localStorage.removeItem('tkaBank');renderBank();toast('Bank soal dikosongkan')};
$('#importJson').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(Array.isArray(d.questions)){currentQuestions=d.questions;assessmentMeta=d.assessmentMeta||null;if(assessmentMeta){applyAssessmentMeta(assessmentMeta);if(!assessmentMeta.imagePrompts)assessmentMeta.imagePrompts=buildImagePrompts(currentQuestions,assessmentMeta)}currentQuestions.forEach((q,i)=>{q.no=i+1;q.kunci=q.kunci||getKey(q);q.poin=q.poin||getPoint(q)});renderAll()}if(Array.isArray(d.bank))localStorage.setItem('tkaBank',JSON.stringify(d.bank));if(d.kopConfig){kopConfig={mode:d.kopConfig.mode||'default',customDataUrl:d.kopConfig.customDataUrl||''};persistKopConfig();updateKopPreview()}renderBank();toast('Data berhasil diimport')}catch(err){console.error(err);toast('File JSON tidak valid')}});

$('#phase').value='Fase D';
updateExamTypeControls();
setSubjects(true);updateAssessmentControls();updateKopPreview();updateAiModelNote();updateGenerationModeUi();renderAll();checkAiStatus();
