const RESTAURANTS = [
  { name: 'ร้านเบ็บติส',       emoji: '🥘', color: '#ffb8d0', tagline: 'กินเบ็บติสกันมั้ย? 😋' },
  { name: 'แปะเตียง',          emoji: '🥟', color: '#ffd6a5', tagline: 'แปะเตียงแซ่บปะ~ 🥢' },
  { name: 'ยูนิคอร์น',         emoji: '🦄', color: '#fff3a0', tagline: 'ม้ายูนิคอร์นเรียกหา 🌈' },
  { name: 'ส้มตำแฟลต',         emoji: '🥗', color: '#caffbf', tagline: 'ส้มตำแฟลต จัดเผ็ดๆ! 🌶️' },
  { name: 'ส้มตำยูนิคอร์น',    emoji: '🌶️', color: '#a0e7e5', tagline: 'ส้มตำสายรุ้งมาแล้ว! ✨' },
  { name: 'เต๋วไก่',           emoji: '🍗', color: '#a5d8ff', tagline: 'ก๋วยเตี๋ยวไก่หอมๆ 🍜' },
  { name: 'กระเพราตาเหล่',     emoji: '🍳', color: '#c7baff', tagline: 'กะเพราไข่ดาวเดี๋ยวนี้! 🔥' },
  { name: 'เต๋วตึกแดง',        emoji: '🍜', color: '#ffadad', tagline: 'เต๋วตึกแดงเด็ดสุดดด 🏠' },
  { name: 'พอวา',             emoji: '🍱', color: '#ffc6ff', tagline: 'พอวาอร่อยจุงเบยย 💕' },
  { name: 'ตามสั่งตึกแดง',     emoji: '🥢', color: '#bdb2ff', tagline: 'จะสั่งอะไรก็ได้! 🍽️' },
];

const $ = (id) => document.getElementById(id);
const canvas = $('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = $('spinBtn');
const resultCard = $('resultCard');
const dishEmojiEl = $('dishEmoji');
const dishName = $('dishName');
const dishTagline = $('dishTagline');
const historyEl = $('history');
const sparklesEl = $('sparkles');
const speechEl = $('speech');
const closeBtn = $('closeBtn');
const spinAgainBtn = $('spinAgainBtn');
const chipsEl = $('restaurantChips');

const SIZE = 600;
const RADIUS = SIZE / 2 - 6;
const CENTER = SIZE / 2;

let currentRotation = -Math.PI / 2;
let isSpinning = false;
const enabled = new Set(RESTAURANTS.map((_, i) => i));
const history = [];
const MAX_HISTORY = 5;

function renderChips() {
  chipsEl.innerHTML = RESTAURANTS.map((r, i) => `
    <label class="chip" style="--chip-color:${r.color}" data-idx="${i}">
      <input type="checkbox" ${enabled.has(i) ? 'checked' : ''} data-idx="${i}" />
      <span class="chip-emoji">${r.emoji}</span>
      <span class="chip-text">${r.name}</span>
    </label>
  `).join('');
  chipsEl.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = Number(e.target.dataset.idx);
      if (e.target.checked) enabled.add(idx);
      else enabled.delete(idx);
      drawWheel(buildPool());
    });
  });
}

function buildPool() {
  return RESTAURANTS.map((r, i) => ({ ...r, idx: i })).filter(r => enabled.has(r.idx));
}

function drawWheel(pool) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  if (pool.length === 0) {
    ctx.save();
    ctx.translate(CENTER, CENTER);
    ctx.fillStyle = '#fafafa';
    ctx.beginPath();
    ctx.arc(0, 0, RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8b7a93';
    ctx.font = 'bold 32px Mali';
    ctx.textAlign = 'center';
    ctx.fillText('เลือกร้านอย่างน้อย 1 ร้านน้า 🥺', 0, 0);
    ctx.restore();
    return;
  }

  const sliceAngle = (Math.PI * 2) / pool.length;
  ctx.save();
  ctx.translate(CENTER, CENTER);
  ctx.rotate(currentRotation);

  pool.forEach((r, i) => {
    const start = i * sliceAngle;
    const end = start + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, RADIUS, start, end);
    ctx.closePath();
    ctx.fillStyle = r.color;
    ctx.fill();
    ctx.strokeStyle = '#4a3b52';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.save();
    ctx.rotate(start + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    ctx.font = '54px serif';
    ctx.fillText(r.emoji, RADIUS - 30, -2);

    ctx.fillStyle = '#4a3b52';
    ctx.font = 'bold 22px Mali';
    ctx.fillText(r.name, RADIUS - 90, 0);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(0, 0, RADIUS * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#4a3b52';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.restore();
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function spin() {
  if (isSpinning) return;
  const pool = buildPool();
  if (pool.length === 0) {
    setSpeech('เลือกร้านก่อนน้า~ 🥺');
    return;
  }
  if (pool.length === 1) {
    setSpeech('เหลือร้านเดียวแล้วน้า!');
  }

  hideResult();
  isSpinning = true;
  spinBtn.disabled = true;
  setSpeech('ลุ้นนน~ 🤞');

  const sliceAngle = (Math.PI * 2) / pool.length;
  const winIndex = Math.floor(Math.random() * pool.length);
  const sliceCenter = winIndex * sliceAngle + sliceAngle / 2;
  const fullTurns = 6 + Math.floor(Math.random() * 3);
  const finalRotation = -Math.PI / 2 - sliceCenter - fullTurns * Math.PI * 2;

  const startRotation = currentRotation;
  const duration = 4200;
  const startTime = performance.now();

  function animate(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = easeOutCubic(t);
    currentRotation = startRotation + (finalRotation - startRotation) * eased;
    drawWheel(pool);
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      currentRotation = ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI * 2;
      isSpinning = false;
      spinBtn.disabled = false;
      onWin(pool[winIndex]);
    }
  }
  requestAnimationFrame(animate);
}

function onWin(r) {
  setSpeech(`ไป ${r.name}! 😋`);
  showResult(r);
  addToHistory(r);
  burstSparkles();
}

function showResult(r) {
  dishEmojiEl.textContent = r.emoji;
  dishName.textContent = r.name;
  dishTagline.textContent = r.tagline;
  resultCard.classList.remove('hidden');
  setTimeout(() => {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
}

function hideResult() {
  resultCard.classList.add('hidden');
}

function addToHistory(r) {
  history.unshift(r);
  if (history.length > MAX_HISTORY) history.pop();
  renderHistory();
}

function renderHistory() {
  if (history.length === 0) {
    historyEl.innerHTML = '<li class="history-empty">ยังไม่มีร้านที่สุ่ม... 🥺</li>';
    return;
  }
  historyEl.innerHTML = history.map(r => `
    <li>
      <span class="h-emoji">${r.emoji}</span>
      <span>${r.name}</span>
    </li>
  `).join('');
}

function setSpeech(msg) {
  speechEl.textContent = msg;
}

const SPARKLE_CHARS = ['✨', '⭐', '💖', '🎉', '💕', '🌟'];
function burstSparkles() {
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.textContent = SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
    const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.6;
    const dist = 120 + Math.random() * 80;
    s.style.left = '50%';
    s.style.top = '50%';
    s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    sparklesEl.appendChild(s);
    setTimeout(() => s.remove(), 1100);
  }
}

spinBtn.addEventListener('click', spin);
spinAgainBtn.addEventListener('click', () => { hideResult(); spin(); });
closeBtn.addEventListener('click', hideResult);

renderChips();
drawWheel(buildPool());

const TIPS = ['หิวมั้ยจ๊ะ~ 💕', 'หมุนเลย!~ ✨', 'อยากกินที่ไหนดี? 🤔', 'มาเลือกร้านกัน! 🍽️'];
let tipIdx = 0;
setInterval(() => {
  if (isSpinning) return;
  tipIdx = (tipIdx + 1) % TIPS.length;
  setSpeech(TIPS[tipIdx]);
}, 4000);
