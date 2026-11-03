// 這些是示範資料，正式上線時可替換成真實毛孩資訊。
const animals = [
  { name: '阿萌', type: '狗狗', icon: '🐕', image: '肥萌.jpg', detail: '男生・1 歲', story: '喜歡曬太陽和散步，是個溫柔又親人的孩子。', org: '暖心動物之家' },
  { name: '花花', type: '貓咪', icon: '🐈', image: '花花.jpg', detail: '女生・約 1 歲', story: '有一點害羞，熟悉之後會悄悄靠近你。', org: '小小尾巴守護協會' },
  { name: '阿福', type: '狗狗', icon: '🐶', image: '阿福.jpg', detail: '男生・約 4 歲', story: '愛笑也愛撒嬌，希望每天都能和你一起玩。', org: '暖心動物之家' },
  { name: '小圓', type: '貓咪', icon: '🐱', image: '小圓.jpg', detail: '女生・約 2 歲', story: '喜歡安靜地陪伴，也喜歡被溫柔摸摸頭。', org: '小小尾巴守護協會' }
];
// 優先使用目前瀏覽器已儲存的資料。
try { const saved = JSON.parse(localStorage.getItem('毛日子毛孩資料')); if (Array.isArray(saved)) { saved.forEach(animal => { if (animal.name === '小麥' && animal.org === '暖心動物之家' && animal.story === '喜歡曬太陽和散步，是個溫柔又親人的孩子。') { animal.name = '阿萌'; animal.detail = '男生・1 歲'; } }); saved.forEach(animal => { if (animal.name === '阿萌' && animal.image === '肥萌.jpg' && animal.detail === '約 1 歲') animal.detail = '男生・1 歲'; }); animals.splice(0, animals.length, ...saved); } } catch (error) {}
const list = document.querySelector('#animal-list');
const overlay = document.querySelector('#overlay');
const title = document.querySelector('#popup-title');
const message = document.querySelector('#popup-message');
const donationForm = document.querySelector('#donation-form');

// 根據選擇的種類更新畫面。
function escapeText(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function showAnimals(filter) {
  const results = animals.filter(animal => filter === '全部' || animal.type === filter);
  list.innerHTML = results.map(item => { const animal = Object.fromEntries(Object.entries(item).map(([key, value]) => [key, escapeText(value)])); return `
    <article class="animal-card"><div class="animal-art"><span>示範照片</span>${animal.icon}<img src="${animal.image}" alt="${animal.name}的示意照片"></div><h3>${animal.name}</h3><p class="details">${animal.type} ／ ${animal.detail}</p><p class="pet-status">${animal.status || '開放領養'} ／ 更新日期：${animal.updated || '2026-11-02（示範）'}</p><p>${animal.story}</p><button data-animal="${animal.name}"><span>⌂ ${animal.org}</span><strong>認識我 ↗</strong></button>${animal.status === '已送養' || animal.status === '審核中' ? '' : `<button class="adopt-button" data-adopt="${animal.name}">我要領養 ↗</button>`}</article>
  `; }).join('');
}
function openPopup(heading, content) {
  title.textContent = heading;
  message.textContent = content;
  donationForm.hidden = true;
  overlay.hidden = false;
  document.querySelector('#close-popup').focus();
}
function closePopup() { overlay.hidden = true; }

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  showAnimals(button.dataset.filter);
}));
list.addEventListener('click', event => {
  const button = event.target.closest('[data-animal]');
  if (!button) return;
  const animal = animals.find(item => item.name === button.dataset.animal);
  openPopup('認識' + animal.name, animal.detail + '。' + animal.story + ' 這是示範資料，領養與贊助尚未開放。');
});
document.querySelectorAll('[data-org]').forEach(button => button.addEventListener('click', () => {
  openPopup('把心意送給牠們', '這項贊助支持所選組織，示範用途包含飼料、醫療與院區照護；不屬於平台維護費。目前僅供預覽，尚未開放付款。');
  donationForm.reset();
  document.querySelector('#donation-org').value = button.dataset.org;
  document.querySelector('#donation-result').textContent = '';
  document.querySelector('#thank-you-card').hidden = true;
  donationForm.hidden = false;
}));

// 使用隨機識別碼區分瀏覽器，不儲存姓名或聯絡資料。
const communityUrl = 'https://reqvlazljogqhdytjrvm.supabase.co/rest/v1/';
const communityKey = 'sb_publishable_-zrKonVr5tt62JMs-3lY4w_q_6kaZ9a';
let visitorId;
try {
  visitorId = localStorage.getItem('毛日子訪客識別碼');
  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(visitorId || '')) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('毛日子訪客識別碼', visitorId);
  }
} catch (error) { visitorId = null; }
async function refreshCommunityCounts() {
  try {
    const response = await fetch(communityUrl + 'rpc/community_counts', { method: 'POST', headers: { apikey: communityKey, 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('統計讀取失敗');
    const counts = await response.json();
    for (const key of ['visitors', 'organizations', 'platform']) {
      if (!Number.isSafeInteger(counts[key]) || counts[key] < 0) throw new Error('統計格式錯誤');
      document.querySelector('#count-' + key).textContent = counts[key].toLocaleString('zh-TW');
    }
    document.querySelector('#count-status').textContent = '以瀏覽器估算人數；支持人數依贊助心意送出紀錄計算。';
  } catch (error) { document.querySelector('#count-status').textContent = '統計暫時無法更新，請稍後再試。'; }
}
async function registerVisitor() {
  if (visitorId) {
    try {
      // 主鍵避免同一瀏覽器重複登記，重複資料直接略過。
      const response = await fetch(communityUrl + 'community_visitors', { method: 'POST', headers: { apikey: communityKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ visitor_id: visitorId }), signal: AbortSignal.timeout(10000) });
      if (!response.ok && response.status !== 409) throw new Error('訪客登記失敗');
    } catch (error) {
      await refreshCommunityCounts();
      document.querySelector('#count-status').textContent = '這次瀏覽暫時無法登記，請重新整理後再試。';
      return;
    }
  }
  await refreshCommunityCounts();
}
registerVisitor();
setInterval(() => { if (!document.hidden) refreshCommunityCounts(); }, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshCommunityCounts(); });

// 贊助僅供練習，送出的是預覽紀錄，不代表付款。
async function saveSponsorship(data) {
  const response = await fetch('https://reqvlazljogqhdytjrvm.supabase.co/rest/v1/sponsorship_previews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_-zrKonVr5tt62JMs-3lY4w_q_6kaZ9a', 'Prefer': 'return=minimal' },
    body: JSON.stringify({ ...data, visitor_id: visitorId })
  });
  if (!response.ok) throw new Error('儲存失敗');
  refreshCommunityCounts();
}
donationForm.addEventListener('submit', async event => {
  event.preventDefault();
  const org = document.querySelector('#donation-org').value;
  const purpose = document.querySelector('#donation-purpose').value;
  const amount = Number(document.querySelector('#donation-amount').value);
  if (!Number.isInteger(amount) || amount < 1 || amount > 10000000) { document.querySelector('#donation-result').textContent = '請輸入一元至一千萬元的整數金額。'; return; }
  const submitButton = donationForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  document.querySelector('#donation-result').textContent = '正在送出贊助意願，請稍候。';
  try {
    await saveSponsorship({ category: '組織贊助', item: org, purpose, amount });
    document.querySelector('#donation-result').textContent = '送出贊助心意：' + org + ' ／ 新臺幣 ' + amount + ' 元 ／ ' + purpose + '。尚未付款或寄送。';
  } catch (error) {
    document.querySelector('#donation-result').textContent = '贊助意願儲存失敗，請檢查網路後再試。';
    return;
  } finally { submitButton.disabled = false; }
  // 從所選組織有照片的毛孩中隨機挑選，製作感謝明信片。
  const card = document.querySelector('#thank-you-card');
  card.replaceChildren();
  const candidates = animals.filter(animal => animal.org === org && animal.image);
  const pet = candidates[Math.floor(Math.random() * candidates.length)];
  if (pet) {
    const photo = document.createElement('img'); photo.src = pet.image; photo.alt = org + '的毛孩' + pet.name + '照片'; card.append(photo);
  }
  const caption = document.createElement('div');
  const heading = document.createElement('strong'); heading.textContent = '謝謝你，讓愛繼續發光 ✳';
  const text = document.createElement('p'); text.textContent = '謝謝你願意支持「' + org + '」！你的溫柔，讓照顧毛孩的路多了一份力量。' + (pet ? '這是 ' + pet.name + ' 送給你的感謝。' : '期待與你分享毛孩們的故事。');
  const note = document.createElement('small'); note.textContent = '示範明信片：尚未付款、寄送或完成贊助。';
  caption.append(heading, text, note); card.append(caption); card.hidden = false;
});
document.querySelectorAll('[data-plan]').forEach(button => button.addEventListener('click', async () => {
  const [item, amountText] = button.dataset.plan.split(' ／ ');
  const amount = Number(amountText.replace(' 元', ''));
  button.disabled = true;
  const waitingText = '正在儲存「' + item + '」的預覽紀錄，請稍候。';
  openPopup('支持毛日子', waitingText);
  try {
    await saveSponsorship({ category: '平台贊助', item, purpose: '平台維護', amount });
    if (!overlay.hidden && message.textContent === waitingText) message.textContent = '已儲存「' + button.dataset.plan + '」的預覽紀錄。這是示範方案，尚未付款或發送獎勵。';
  } catch (error) {
    if (!overlay.hidden && message.textContent === waitingText) message.textContent = '預覽紀錄儲存失敗，請檢查網路後再試。';
  } finally { button.disabled = false; }
}));
document.querySelector('#join-button').addEventListener('click', () => openPopup('邀請組織加入', '謝謝你為動物付出。組織加入與資料刊登功能目前尚未開放。'));
document.querySelector('#close-popup').addEventListener('click', closePopup);
overlay.addEventListener('click', event => { if (event.target === overlay) closePopup(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closePopup(); });
showAnimals('全部');

// 照片無法載入時，顯示下方的動物圖案。
document.addEventListener('error', event => {
  if (event.target.tagName === 'IMG') event.target.style.display = 'none';
}, true);

// 音樂檔放在網站資料夾後，可在這個清單加入名稱與檔案。
const playlist = [{ title: '溫柔旋律', file: '溫柔旋律.wav' }];
const music = new Audio();
const musicButton = document.querySelector('#music-button');
const musicList = document.querySelector('#music-list');
const musicProgress = document.querySelector('#music-progress');
const musicTime = document.querySelector('#music-time');
const musicMessage = document.querySelector('#music-message');
let currentTrack = 0;
playlist.forEach((track, index) => { const option = document.createElement('option'); option.value = index; option.textContent = track.title; musicList.append(option); });
function timeText(seconds) { if (!Number.isFinite(seconds)) return '0:00'; return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0'); }
function updateMusic() {
  const duration = Number.isFinite(music.duration) ? music.duration : 0;
  musicProgress.value = duration ? Math.round(music.currentTime / duration * 1000) : 0;
  musicTime.textContent = timeText(music.currentTime) + ' / ' + timeText(duration);
  musicButton.textContent = music.paused ? '♫ 播放' : '♫ 暫停';
  musicButton.setAttribute('aria-pressed', String(!music.paused));
}
function chooseTrack(index) { currentTrack = index; music.src = playlist[index].file; musicList.value = String(index); musicMessage.textContent = ''; music.load(); updateMusic(); }
async function startMusic() { try { await music.play(); } catch (error) { musicMessage.textContent = '音樂無法播放，請確認檔案存在。'; } updateMusic(); }
musicButton.addEventListener('click', () => { if (music.paused) startMusic(); else { music.pause(); updateMusic(); } });
musicList.addEventListener('change', () => { const playing = !music.paused; chooseTrack(Number(musicList.value)); if (playing) startMusic(); });
musicProgress.addEventListener('input', () => { if (Number.isFinite(music.duration)) music.currentTime = music.duration * Number(musicProgress.value) / 1000; });
music.addEventListener('timeupdate', updateMusic);
music.addEventListener('loadedmetadata', updateMusic);
music.addEventListener('ended', () => { chooseTrack((currentTrack + 1) % playlist.length); startMusic(); });
music.addEventListener('error', () => { musicMessage.textContent = '音樂無法載入，請確認檔案存在。'; updateMusic(); });
chooseTrack(0);

// 調整根字體大小，並記住使用者的選擇。
const fontSmaller = document.querySelector('#font-smaller');
const fontLarger = document.querySelector('#font-larger');
const fontStatus = document.querySelector('#font-size-status');
let fontSize = 100;
try {
  const savedSize = Number(localStorage.getItem('毛日子字體大小'));
  if (savedSize >= 70 && savedSize <= 150) fontSize = savedSize;
} catch (error) {
  // 無法儲存設定時，仍可在目前頁面調整字體。
}
function updateFontSize() {
  document.documentElement.style.fontSize = fontSize + '%';
  fontStatus.textContent = fontSize + '%';
  fontSmaller.disabled = fontSize <= 70;
  fontLarger.disabled = fontSize >= 150;
  try { localStorage.setItem('毛日子字體大小', String(fontSize)); } catch (error) {}
}
fontSmaller.addEventListener('click', () => { fontSize = Math.max(70, fontSize - 10); updateFontSize(); });
fontLarger.addEventListener('click', () => { fontSize = Math.min(150, fontSize + 10); updateFontSize(); });
document.querySelector('#font-reset').addEventListener('click', () => { fontSize = 100; updateFontSize(); });
updateFontSize();

// 管理資料僅儲存在目前瀏覽器，移除資料不會刪除任何檔案。
const manageOverlay = document.querySelector('#manage-overlay');
const manageForm = document.querySelector('#manage-form');
const manageList = document.querySelector('#manage-list');
const manageStatus = document.querySelector('#manage-status');
const field = id => document.querySelector('#' + id);
function renderManageList() {
  manageList.innerHTML = '';
  animals.forEach((animal, index) => {
    const row = document.createElement('div'); row.className = 'manage-row';
    const label = document.createElement('span'); label.textContent = animal.name + ' ／ ' + animal.org;
    const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = '編輯';
    edit.addEventListener('click', () => { field('edit-index').value = index; field('pet-name').value = animal.name; field('pet-type').value = animal.type; field('pet-detail').value = animal.detail; field('pet-story').value = animal.story; field('pet-org').value = animal.org; field('pet-status').value = animal.status || '開放領養'; field('pet-photo').value = ''; manageStatus.textContent = '正在編輯「' + animal.name + '」，不選照片會保留原照片。'; });
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '移除資料';
    remove.addEventListener('click', () => { if (!confirm('確定移除「' + animal.name + '」的資料嗎？照片檔案不會被刪除。')) return; const next = animals.filter((_, i) => i !== index); try { localStorage.setItem('毛日子毛孩資料', JSON.stringify(next)); animals.splice(0, animals.length, ...next); renderManageList(); showAnimals('全部'); manageStatus.textContent = '已移除資料。'; } catch (error) { manageStatus.textContent = '無法儲存，資料沒有變更。'; } });
    row.append(label, edit, remove); manageList.append(row);
  });
}
field('manage-open').addEventListener('click', () => { renderManageList(); manageOverlay.hidden = false; field('manage-close').focus(); });
field('manage-close').addEventListener('click', () => { manageOverlay.hidden = true; });
manageOverlay.addEventListener('click', event => { if (event.target === manageOverlay) manageOverlay.hidden = true; });
document.addEventListener('keydown', event => { if (event.key === 'Escape') manageOverlay.hidden = true; });
field('manage-clear').addEventListener('click', () => { manageForm.reset(); field('edit-index').value = ''; manageStatus.textContent = ''; });
manageForm.addEventListener('submit', async event => {
  event.preventDefault();
  const raw = field('edit-index').value; const index = raw === '' ? -1 : Number(raw); const file = field('pet-photo').files[0];
  if (file && file.size > 1500000) { manageStatus.textContent = '請選擇小於一點五百萬位元組的照片。'; return; }
  let image = index >= 0 ? animals[index].image : '';
  if (file) { try { image = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); } catch (error) { manageStatus.textContent = '照片讀取失敗。'; return; } }
  const type = field('pet-type').value;
  const pet = {name: field('pet-name').value.trim(), type, icon: type === '狗狗' ? '🐕' : '🐈', status: field('pet-status').value, updated: new Date().toLocaleDateString('sv-SE'), detail: field('pet-detail').value.trim(), story: field('pet-story').value.trim(), org: field('pet-org').value.trim(), image};
  if (!pet.name || !pet.detail || !pet.story || !pet.org) { manageStatus.textContent = '請填寫完整資料。'; return; }
  const next = animals.slice(); if (index >= 0) next[index] = pet; else next.push(pet);
  try { localStorage.setItem('毛日子毛孩資料', JSON.stringify(next)); animals.splice(0, animals.length, ...next); manageForm.reset(); field('edit-index').value = ''; renderManageList(); showAnimals('全部'); manageStatus.textContent = '已儲存在目前瀏覽器。'; } catch (error) { manageStatus.textContent = '儲存失敗，可能是瀏覽器空間不足或不允許儲存。'; }
});

// 領養申請與審核紀錄只儲存在此瀏覽器。
const adoptionOverlay = document.querySelector('#adoption-overlay');
const adoptionForm = document.querySelector('#adoption-form');
const adoptionStatus = document.querySelector('#adoption-status');
let selectedPet = '';
function readApplications() {
  try { const data = JSON.parse(localStorage.getItem('毛日子領養申請')); return Array.isArray(data) ? data : []; } catch (error) { return []; }
}
function renderApplications() {
  const container = document.querySelector('#application-list');
  container.replaceChildren();
  const applications = readApplications();
  if (!applications.length) { container.textContent = '目前沒有領養申請。'; return; }
  applications.forEach((item, index) => {
    const row = document.createElement('div'); row.className = 'application-row';
    const info = document.createElement('p'); info.textContent = '毛孩：' + item.pet + ' ／ 申請人：' + item.name + ' ／ 聯絡方式：' + item.contact + ' ／ 領養後聯絡管道：' + (item.followup || '尚未提供') + ' ／ 留言：' + (item.note || '無') + ' ／ 狀態：' + item.status;
    const select = document.createElement('select'); select.setAttribute('aria-label', '更新申請審核狀態');
    ['待審核', '審核中', '已通過', '未通過'].forEach(status => { const option = document.createElement('option'); option.value = status; option.textContent = status; select.append(option); });
    select.value = item.status;
    select.addEventListener('change', () => { const updated = readApplications(); if (!updated[index]) return; updated[index].status = select.value; try { localStorage.setItem('毛日子領養申請', JSON.stringify(updated)); renderApplications(); } catch (error) { alert('無法儲存審核結果。'); renderApplications(); } });
    row.append(info, select);
    const followupLabel = document.createElement('label'); followupLabel.textContent = '後續追蹤紀錄';
    const followupInput = document.createElement('textarea'); followupInput.rows = 3; followupInput.maxLength = 300; followupInput.value = item.followupNote || ''; followupInput.placeholder = '例如聯繫日期與追蹤情況';
    const saveFollowup = document.createElement('button'); saveFollowup.type = 'button'; saveFollowup.className = 'outline-button'; saveFollowup.textContent = '儲存追蹤紀錄';
    const feedback = document.createElement('p'); feedback.setAttribute('aria-live', 'polite');
    saveFollowup.addEventListener('click', () => { const updated = readApplications(); if (!updated[index]) return; updated[index].followupNote = followupInput.value.trim(); try { localStorage.setItem('毛日子領養申請', JSON.stringify(updated)); feedback.textContent = '已儲存在目前瀏覽器。'; } catch (error) { feedback.textContent = '無法儲存追蹤紀錄。'; } });
    followupLabel.append(followupInput); row.append(followupLabel, saveFollowup, feedback); container.append(row);
  });
}
list.addEventListener('click', event => {
  const button = event.target.closest('[data-adopt]'); if (!button) return;
  selectedPet = button.dataset.adopt; adoptionForm.reset(); adoptionStatus.textContent = '';
  document.querySelector('#adoption-title').textContent = '申請領養' + selectedPet;
  adoptionOverlay.hidden = false; document.querySelector('#applicant-name').focus();
});
document.querySelector('#adoption-close').addEventListener('click', () => { adoptionOverlay.hidden = true; });
adoptionOverlay.addEventListener('click', event => { if (event.target === adoptionOverlay) adoptionOverlay.hidden = true; });
document.addEventListener('keydown', event => { if (event.key === 'Escape') adoptionOverlay.hidden = true; });
adoptionForm.addEventListener('submit', async event => {
  event.preventDefault();
  const name = document.querySelector('#applicant-name').value.trim();
  const contact = document.querySelector('#applicant-contact').value.trim();
  const note = document.querySelector('#applicant-message').value.trim();
  const followup = document.querySelector('#followup-contact').value.trim();
  if (!name || !contact || !followup) { adoptionStatus.textContent = '請填寫稱呼、聯絡方式與領養後聯絡管道。'; return; }
  // 公開金鑰只用於新增申請，不能讀取其他人的資料。
  const button = adoptionForm.querySelector('button[type="submit"]');
  button.disabled = true;
  adoptionStatus.textContent = '正在送出申請，請稍候。';
  try {
    const response = await fetch('https://reqvlazljogqhdytjrvm.supabase.co/rest/v1/adoption_applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_-zrKonVr5tt62JMs-3lY4w_q_6kaZ9a', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ pet: selectedPet, name, contact, followup, note })
    });
    if (!response.ok) throw new Error('送出失敗');
    adoptionForm.reset();
    adoptionStatus.textContent = '申請已送出，感謝你的填寫。';
  } catch (error) {
    adoptionStatus.textContent = '送出失敗，請檢查網路連線後再試一次。';
  } finally {
    button.disabled = false;
  }
});
document.querySelector('#manage-open').addEventListener('click', renderApplications);

// 示範組織尚無真實網址，避免導向錯誤的網站。
document.querySelectorAll('[data-org-info]').forEach(button => button.addEventListener('click', () => {
  openPopup('了解' + button.dataset.orgInfo, '這是示範組織，目前沒有實際官網或聯絡資訊。未來加入真實合作組織後，可在這裡提供官方網站連結。');
}));

// 公告僅儲存在目前瀏覽器；移除公告不會刪除檔案。
const sampleNews = [
  {org:'暖心動物之家', title:'毛孩日常照護近況', content:'未來可在這裡分享毛孩照護、活動和物資需求等消息。', date:'日期待提供', sample:true},
  {org:'小小尾巴守護協會', title:'一起關注救援與認養', content:'未來可在這裡發布認養活動與協會最新公告。', date:'日期待提供', sample:true}
];
function readNews() { try { const saved = JSON.parse(localStorage.getItem('毛日子協會公告')); return Array.isArray(saved) ? saved : sampleNews; } catch (error) { return sampleNews; } }
function renderNews() {
  const list = document.querySelector('#news-list'); const manage = document.querySelector('#news-manage-list');
  list.replaceChildren(); manage.replaceChildren();
  const news = readNews();
  if (!news.length) list.textContent = '目前沒有公告。';
  news.forEach((item, index) => {
    const article = document.createElement('article'); const content = document.createElement('div');
    const source = document.createElement('span'); source.textContent = item.org + (item.sample ? ' ／ 示範消息' : ' ／ 本機公告');
    const heading = document.createElement('h4'); heading.textContent = item.title;
    const paragraph = document.createElement('p'); paragraph.textContent = item.content;
    const date = document.createElement('span'); date.className = 'news-date'; date.textContent = item.date;
    content.append(source, heading, paragraph); article.append(content, date); list.append(article);
    const row = document.createElement('div'); row.className = 'manage-row';
    const label = document.createElement('span'); label.textContent = item.org + ' ／ ' + item.title;
    const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = '編輯';
    edit.addEventListener('click', () => { document.querySelector('#news-edit').value = index; document.querySelector('#news-org').value = item.org; document.querySelector('#news-title').value = item.title; document.querySelector('#news-content').value = item.content; document.querySelector('#news-status').textContent = '正在編輯公告。'; });
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '移除公告';
    remove.addEventListener('click', () => { if (!confirm('確定移除這則公告嗎？')) return; const next = readNews(); next.splice(index, 1); try { localStorage.setItem('毛日子協會公告', JSON.stringify(next)); renderNews(); document.querySelector('#news-status').textContent = '已移除公告。'; } catch (error) { document.querySelector('#news-status').textContent = '無法儲存，公告沒有變更。'; } });
    row.append(label, edit, remove); manage.append(row);
  });
}
const newsForm = document.querySelector('#news-form');
newsForm.addEventListener('submit', event => {
  event.preventDefault();
  const org = document.querySelector('#news-org').value.trim(); const title = document.querySelector('#news-title').value.trim(); const content = document.querySelector('#news-content').value.trim();
  if (!org || !title || !content) { document.querySelector('#news-status').textContent = '請填寫協會名稱、標題與內容。'; return; }
  const raw = document.querySelector('#news-edit').value; const news = readNews();
  const item = {org, title, content, date:new Date().toLocaleDateString('zh-TW'), sample:false};
  if (raw === '') news.unshift(item); else news[Number(raw)] = item;
  try { localStorage.setItem('毛日子協會公告', JSON.stringify(news)); newsForm.reset(); document.querySelector('#news-edit').value = ''; renderNews(); document.querySelector('#news-status').textContent = '公告已儲存在目前瀏覽器。'; } catch (error) { document.querySelector('#news-status').textContent = '儲存失敗，請檢查瀏覽器儲存設定。'; }
});
document.querySelector('#news-clear').addEventListener('click', () => { newsForm.reset(); document.querySelector('#news-edit').value = ''; document.querySelector('#news-status').textContent = ''; });
renderNews();
