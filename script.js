// =====================
// ⚙️ JSONBin.io 설정
// =====================
const JSONBIN_API_KEY  = '$2a$10$GYpjoju36J73auJdeSr3KuFFNT4T2fcuVdkWczzzHfx72unAR2Wu2';
const JSONBIN_BIN_ID   = '699e7cf1ae596e708f474d9a';
const JSONBIN_BASE_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// =====================
// State
// =====================
let messages        = [];
let selectedSticker = '🗽';
let selectedColor   = 'navy';
let currentFilter   = 'all';
let isLoading       = false;

// =====================
// DOM
// =====================
const authorInput  = document.getElementById('authorInput');
const toInput      = document.getElementById('toInput');
const messageInput = document.getElementById('messageInput');
const charCount    = document.getElementById('charCount');
const submitBtn    = document.getElementById('submitBtn');
const board        = document.getElementById('board');
const emptyState   = document.getElementById('emptyState');
const messageCount = document.getElementById('messageCount');
const modalOverlay = document.getElementById('modalOverlay');
const toast        = document.getElementById('toast');
const particles    = document.getElementById('particles');

// Write Panel
const writeToggleBtn     = document.getElementById('writeToggleBtn');
const writePanel         = document.getElementById('writePanel');
const writePanelOverlay  = document.getElementById('writePanelOverlay');
const writePanelClose    = document.getElementById('writePanelClose');

// =====================
// Write Panel Toggle
// =====================
function openWritePanel() {
  writePanel.classList.add('open');
  writePanelOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Auto-focus name field
  setTimeout(() => authorInput.focus(), 420);
}

function closeWritePanel() {
  writePanel.classList.remove('open');
  writePanelOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

writeToggleBtn.addEventListener('click', openWritePanel);
writePanelClose.addEventListener('click', closeWritePanel);
writePanelOverlay.addEventListener('click', closeWritePanel);

// =====================
// JSONBin API
// =====================
async function fetchMessages() {
  try {
    const res = await fetch(JSONBIN_BASE_URL + '/latest', {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
        'X-Bin-Meta': 'false',
      }
    });
    if (!res.ok) throw new Error('Fetch failed: ' + res.status);
    const data = await res.json();
    return data.messages || [];
  } catch (e) {
    console.error('fetchMessages error:', e);
    return [];
  }
}

async function saveMessages(msgs) {
  try {
    const res = await fetch(JSONBIN_BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY,
      },
      body: JSON.stringify({ messages: msgs }),
    });
    if (!res.ok) throw new Error('Save failed: ' + res.status);
    return true;
  } catch (e) {
    console.error('saveMessages error:', e);
    return false;
  }
}

// =====================
// Background Particles
// =====================
const particleEmojis = ['⭐', '🌟', '✈️', '🗽', '🇺🇸', '🌵', '🎸', '🤠', '🌉', '🏄', '💫', '📸'];

function createParticle() {
  const el = document.createElement('div');
  el.className = 'particle';
  el.textContent = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
  el.style.left = Math.random() * 100 + 'vw';
  el.style.fontSize = (0.7 + Math.random() * 0.9) + 'rem';
  const dur = 10 + Math.random() * 14;
  el.style.animationDuration = dur + 's';
  el.style.animationDelay   = Math.random() * 10 + 's';
  particles.appendChild(el);
  setTimeout(() => el.remove(), (dur + 10) * 1000);
}

for (let i = 0; i < 14; i++) createParticle();
setInterval(createParticle, 2200);

// =====================
// Typing Effect (subtitle)
// =====================
function initTypingEffect() {
  const el = document.querySelector('.subtitle');
  if (!el) return;
  const text = el.textContent;
  el.textContent = '';
  el.style.borderRight = '2px solid rgba(255,255,255,0.7)';
  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, 40);
    } else {
      setTimeout(() => { el.style.borderRight = 'none'; }, 1200);
    }
  }
  setTimeout(type, 950);
}

initTypingEffect();

// =====================
// Header Parallax
// =====================
window.addEventListener('scroll', () => {
  document.querySelector('.header').style.backgroundPositionY =
    `calc(50% + ${window.scrollY * 0.35}px)`;
}, { passive: true });

// =====================
// Sticker Selection
// =====================
document.querySelectorAll('.sticker-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sticker-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedSticker = btn.dataset.sticker;
  });
});

// =====================
// Color Selection
// =====================
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedColor = btn.dataset.color;
  });
});

// =====================
// Char Counter
// =====================
messageInput.addEventListener('input', () => {
  const len = messageInput.value.length;
  charCount.textContent = len;
  document.querySelector('.char-count').style.color = len >= 900 ? '#c0392b' : '#c0c0d8';
});

// =====================
// Confetti
// =====================
function launchConfetti() {
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '9999',
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#c0392b', '#1a3a6b', '#f1c40f', '#2ecc71', '#74b9ff', '#fff', '#e67e22'];
  const pieces = Array.from({ length: 130 }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height * -0.5,
    w:     6  + Math.random() * 8,
    h:     10 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot:   Math.random() * 360,
    rotV:  (Math.random() - 0.5) * 9,
    vx:    (Math.random() - 0.5) * 5,
    vy:    3 + Math.random() * 5,
    alpha: 1,
  }));

  let frame;
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      if (p.alpha <= 0) return;
      alive = true;
      p.x  += p.vx;
      p.y  += p.vy;
      p.rot += p.rotV;
      if (p.y > canvas.height * 0.75) p.alpha -= 0.022;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (alive) frame = requestAnimationFrame(draw);
    else canvas.remove();
  })();

  setTimeout(() => { cancelAnimationFrame(frame); canvas.remove(); }, 5000);
}

// =====================
// Submit Success Animation
// =====================
function triggerSubmitSuccess() {
  submitBtn.classList.add('success');
  const spanEl = submitBtn.querySelector('span');
  spanEl.textContent = '✓ Posted!';
  setTimeout(() => {
    submitBtn.classList.remove('success');
    spanEl.textContent = 'Post Your Message!';
  }, 2200);
}

// =====================
// Submit
// =====================
submitBtn.addEventListener('click', async () => {
  if (isLoading) return;

  const author  = authorInput.value.trim();
  const to      = toInput.value.trim();
  const message = messageInput.value.trim();

  if (!author) {
    showToast('✏️ Please enter your name!');
    authorInput.focus();
    shakeElement(authorInput);
    return;
  }
  if (!message) {
    showToast('💬 Please write a message!');
    messageInput.focus();
    shakeElement(messageInput);
    return;
  }

  setLoading(true);

  const now = new Date();
  const newMsg = {
    id: Date.now(),
    author,
    to,
    message,
    sticker: selectedSticker,
    color: selectedColor,
    date: now.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
    ts: now.getTime(),
  };

  // 낙관적 업데이트
  messages.unshift(newMsg);
  renderBoard(true);
  authorInput.value     = '';
  toInput.value         = '';
  messageInput.value    = '';
  charCount.textContent = '0';
  burstParticles();

  // 패널 닫기 + 성공 애니메이션 + confetti
  closeWritePanel();
  triggerSubmitSuccess();
  launchConfetti();

  // 서버 저장
  const ok = await saveMessages(messages);
  setLoading(false);

  if (ok) {
    showToast('🎉 Your message has been posted!');
  } else {
    showToast('⚠️ Posted locally — check your API key!');
  }
});

// =====================
// Filter
// =====================
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderBoard();
  });
});

// =====================
// Card Observer (scroll reveal)
// =====================
let cardObserver = null;

function initCardObserver() {
  if (cardObserver) cardObserver.disconnect();
  cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.replace('reveal-hidden', 'reveal-visible');
        }, i * 60);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.message-card.reveal-hidden').forEach(c => cardObserver.observe(c));
}

// =====================
// Render Board
// =====================
function renderBoard(isNew = false) {
  board.innerHTML = '';

  let list = [...messages];
  if (currentFilter === 'recent') {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    list = list.filter(m => m.ts && m.ts > cutoff);
  }

  if (list.length === 0) {
    messageCount.textContent = '0 messages';
    const es = document.createElement('div');
    es.className = 'empty-state';
    es.id = 'emptyState';
    es.innerHTML = '<div class="empty-icon">📭</div><p>No messages yet.<br/>Be the first one to leave a note!</p>';
    board.appendChild(es);
    return;
  }

  messageCount.textContent = `${messages.length} message${messages.length !== 1 ? 's' : ''}`;
  list.forEach((msg, idx) => {
    board.appendChild(createCard(msg, isNew && idx === 0));
  });

  // Stagger reveal for non-new cards
  setTimeout(() => initCardObserver(), 50);
}

// =====================
// Create Card — 3D Tilt
// =====================
const isTouchDevice = window.matchMedia('(hover: none)').matches;

const cardColorMap = {
  navy:   '#2e5eaa',
  red:    '#e74c3c',
  sky:    '#74b9ff',
  desert: '#e67e22',
  forest: '#2ecc71',
  gold:   '#f1c40f',
};

function createCard(msg, isNew = false) {
  const card = document.createElement('div');

  if (isNew) {
    card.className = `message-card color-${msg.color} new`;
  } else {
    card.className = `message-card color-${msg.color} reveal-hidden`;
  }

  card.innerHTML = `
    <div class="card-sticker">${msg.sticker}</div>
    ${msg.to ? `<div class="card-to">To: ${escapeHtml(msg.to)}</div>` : ''}
    <div class="card-author">From: ${escapeHtml(msg.author)}</div>
    <div class="card-preview">${escapeHtml(msg.message)}</div>
    <div class="card-date">${msg.date}</div>
  `;

  // 3D Tilt (desktop only)
  if (!isTouchDevice) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotY =  ((x - rect.width  / 2) / (rect.width  / 2)) * 12;
      const rotX = -((y - rect.height / 2) / (rect.height / 2)) * 12;
      card.style.setProperty('--mouse-x', (x / rect.width  * 100) + '%');
      card.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
      card.classList.add('tilt-active');
      card.style.transform =
        `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px) scale(1.02)`;
      card.style.transition = 'box-shadow 0.15s';
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('tilt-active');
      card.style.transform = '';
      card.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  }

  card.addEventListener('click', () => openModal(msg, card));
  return card;
}

// =====================
// Modal
// =====================
let currentModalId = null;

function openModal(msg, cardEl) {
  currentModalId = msg.id;
  const modalEl = document.getElementById('modal');

  // 카드 색상으로 border-top 변경
  modalEl.style.borderTopColor = cardColorMap[msg.color] || '#1a3a6b';

  // transform-origin: 클릭한 카드 중심에서 펼쳐지기 (데스크탑만)
  if (cardEl && !isTouchDevice) {
    const r = cardEl.getBoundingClientRect();
    const ox = ((r.left + r.width  / 2) / window.innerWidth  * 100).toFixed(1);
    const oy = ((r.top  + r.height / 2) / window.innerHeight * 100).toFixed(1);
    modalEl.style.transformOrigin = `${ox}vw ${oy}vh`;
  } else {
    modalEl.style.transformOrigin = 'center center';
  }

  // View mode
  document.getElementById('modalSticker').innerHTML = msg.sticker;
  document.getElementById('modalTo').textContent      = msg.to ? `To: ${msg.to}` : '';
  document.getElementById('modalAuthor').textContent  = `From: ${msg.author}`;
  document.getElementById('modalMessage').textContent = msg.message;
  document.getElementById('modalDate').textContent    = msg.date;

  document.getElementById('modalView').style.display = '';
  document.getElementById('modalEdit').style.display = 'none';

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openEditMode(msg) {
  document.getElementById('editSticker').innerHTML = msg.sticker;
  document.getElementById('editAuthor').value  = msg.author;
  document.getElementById('editTo').value      = msg.to || '';
  document.getElementById('editMessage').value = msg.message;

  document.getElementById('modalView').style.display = 'none';
  document.getElementById('modalEdit').style.display = '';
  document.getElementById('editAuthor').focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  currentModalId = null;
}

// ── Mobile swipe-down to close (modal + share modal) ──
function addSwipeDownClose(sheetEl, closeFn) {
  let startY = 0;
  let currentY = 0;
  let dragging = false;

  sheetEl.addEventListener('touchstart', (e) => {
    // only start drag from top handle area (top 60px)
    if (e.touches[0].clientY - sheetEl.getBoundingClientRect().top > 60) return;
    startY   = e.touches[0].clientY;
    dragging = true;
    sheetEl.style.transition = 'none';
  }, { passive: true });

  sheetEl.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    currentY = e.touches[0].clientY;
    const dy = Math.max(0, currentY - startY);
    sheetEl.style.transform = `translateY(${dy}px)`;
  }, { passive: true });

  sheetEl.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    const dy = currentY - startY;
    sheetEl.style.transition = '';
    sheetEl.style.transform  = '';
    if (dy > 80) closeFn();
  });
}

// Edit 버튼
document.getElementById('editBtn').addEventListener('click', () => {
  const msg = messages.find(m => m.id === currentModalId);
  if (msg) openEditMode(msg);
});

// Save 버튼
document.getElementById('saveEditBtn').addEventListener('click', async () => {
  const newAuthor  = document.getElementById('editAuthor').value.trim();
  const newTo      = document.getElementById('editTo').value.trim();
  const newMessage = document.getElementById('editMessage').value.trim();

  if (!newAuthor)  { shakeElement(document.getElementById('editAuthor'));  return; }
  if (!newMessage) { shakeElement(document.getElementById('editMessage')); return; }

  const idx = messages.findIndex(m => m.id === currentModalId);
  if (idx === -1) return;

  messages[idx] = { ...messages[idx], author: newAuthor, to: newTo, message: newMessage };
  renderBoard();

  setLoading(true);
  const ok = await saveMessages(messages);
  setLoading(false);

  showToast(ok ? '✏️ Message updated!' : '⚠️ Updated locally — check API key!');
  closeModal();
});

// Cancel 버튼
document.getElementById('cancelEditBtn').addEventListener('click', () => {
  const msg = messages.find(m => m.id === currentModalId);
  if (msg) openModal(msg);
});


document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeShareModal();
    closeWritePanel();
  }
});

// =====================
// Screenshot Share
// =====================
const shareOverlay        = document.getElementById('shareOverlay');
const sharePreviewImg     = document.getElementById('sharePreviewImg');
const sharePreviewLoading = document.getElementById('sharePreviewLoading');
let   screenshotBlob      = null;

async function openShareModal() {
  shareOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  sharePreviewImg.style.display = 'none';
  sharePreviewLoading.style.display = 'flex';
  screenshotBlob = null;

  document.getElementById('shareNativeBtn').style.display =
    navigator.share ? '' : 'none';

  try {
    const boardSection = document.querySelector('.board-section');
    const canvas = await html2canvas(boardSection, {
      backgroundColor: '#fdfaf4',
      scale: 2,
      useCORS: true,
      logging: false,
      ignoreElements: el => el.classList.contains('particles'),
    });

    canvas.toBlob(blob => {
      screenshotBlob = blob;
      sharePreviewImg.src = URL.createObjectURL(blob);
      sharePreviewImg.style.display = 'block';
      sharePreviewLoading.style.display = 'none';
    }, 'image/png');
  } catch (e) {
    console.error('html2canvas error:', e);
    sharePreviewLoading.innerHTML = '<p>⚠️ Screenshot failed. Try again.</p>';
  }
}

function closeShareModal() {
  shareOverlay.classList.remove('open');
  document.body.style.overflow = '';
  if (sharePreviewImg.src.startsWith('blob:')) {
    URL.revokeObjectURL(sharePreviewImg.src);
  }
  sharePreviewImg.src = '';
}

document.getElementById('shareBtn').addEventListener('click', openShareModal);
document.getElementById('shareModalClose').addEventListener('click', closeShareModal);
shareOverlay.addEventListener('click', e => { if (e.target === shareOverlay) closeShareModal(); });

// ── Swipe-down to close (mobile bottom sheet) ──
addSwipeDownClose(document.getElementById('modal'),      closeModal);
addSwipeDownClose(document.getElementById('shareModal'), closeShareModal);

// 다운로드
document.getElementById('shareDownloadBtn').addEventListener('click', () => {
  if (!screenshotBlob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(screenshotBlob);
  a.download = `usa-rolling-paper-${Date.now()}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  showToast('⬇️ Downloaded!');
});

// 클립보드 복사
document.getElementById('shareCopyBtn').addEventListener('click', async () => {
  if (!screenshotBlob) return;
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': screenshotBlob })
    ]);
    showToast('📋 Image copied to clipboard!');
  } catch (e) {
    showToast('⚠️ Copy not supported on this browser.');
  }
});

// 네이티브 공유 (모바일)
document.getElementById('shareNativeBtn').addEventListener('click', async () => {
  if (!screenshotBlob || !navigator.share) return;
  try {
    const file = new File([screenshotBlob], 'usa-rolling-paper.png', { type: 'image/png' });
    await navigator.share({
      title: 'USA Trip Rolling Paper ✈️',
      text: 'Check out our travel messages! 🗽',
      url: 'https://00fanxi.github.io/usa-rolling-paper/',
      files: navigator.canShare && navigator.canShare({ files: [file] }) ? [file] : undefined,
    });
  } catch (e) {
    if (e.name !== 'AbortError') showToast('⚠️ Share failed.');
  }
});

// =====================
// Loading State
// =====================
function setLoading(state) {
  isLoading = state;
  submitBtn.disabled = state;
  if (!state && !submitBtn.classList.contains('success')) {
    submitBtn.querySelector('span').textContent = 'Post Your Message!';
  }
  submitBtn.style.opacity = state ? '0.7' : '1';
}

// =====================
// Utils
// =====================
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function shakeElement(el) {
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => el.style.animation = '', 400);
}

function burstParticles() {
  const emojis = ['🎉', '⭐', '✨', '🌟', '🗽', '✈️'];
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'particle';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = (15 + Math.random() * 70) + 'vw';
      el.style.fontSize = (1 + Math.random() * 1.2) + 'rem';
      el.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
      el.style.animationDelay = '0s';
      particles.appendChild(el);
      setTimeout(() => el.remove(), 5500);
    }, i * 70);
  }
}

// Shake + Spin keyframe injection
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-8px); }
    40%       { transform: translateX(8px); }
    60%       { transform: translateX(-5px); }
    80%       { transform: translateX(5px); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(styleEl);

// =====================
// 🚀 Init
// =====================
(async () => {
  if (JSONBIN_API_KEY === 'YOUR_API_KEY_HERE' || JSONBIN_BIN_ID === 'YOUR_BIN_ID_HERE') {
    console.warn('⚠️ JSONBin not configured. Using localStorage fallback.');
    messages = JSON.parse(localStorage.getItem('usaTripMessages') || '[]');
    if (messages.length === 0) {
      messages = getSampleData();
      localStorage.setItem('usaTripMessages', JSON.stringify(messages));
    }
    renderBoard();
    return;
  }

  // Loading indicator
  board.innerHTML = `
    <div class="empty-state" id="emptyState">
      <div class="empty-icon" style="animation: spin 1s linear infinite; display:inline-block;">⏳</div>
      <p>Loading messages...</p>
    </div>
  `;

  messages = await fetchMessages();

  if (messages.length === 0) {
    messages = getSampleData();
    await saveMessages(messages);
  }

  renderBoard();
})();

function getSampleData() {
  return [
    {
      id: 1, author: 'Jake from Chicago', to: 'Everyone',
      message: "Grand Canyon blew my mind 🏜️ Nothing can prepare you for how BIG it actually is. 10/10 would stare into the void again.",
      sticker: '🌵', color: 'desert',
      date: 'Feb 23, 2026, 09:14 AM', ts: Date.now() - 1000 * 3600 * 12,
    },
    {
      id: 2, author: 'Mia & Tom', to: 'Our travel crew',
      message: "Vegas was WILD. Lost $20, won $18, and somehow had the best night ever 🎰 Miss you guys already!",
      sticker: '🎰', color: 'gold',
      date: 'Feb 22, 2026, 11:58 PM', ts: Date.now() - 1000 * 3600 * 36,
    },
    {
      id: 3, author: 'Sophie', to: 'Daniel',
      message: "Watching the sunset over the Pacific in Santa Monica — that's a memory I'll keep forever 🌊 Thank you for making this trip happen!",
      sticker: '🏄', color: 'sky',
      date: 'Feb 22, 2026, 07:30 PM', ts: Date.now() - 1000 * 3600 * 48,
    },
    {
      id: 4, author: 'Carlos', to: '',
      message: "NYC pizza at 2AM after Times Square ✌️ They don't make it like this back home. See y'all next year!",
      sticker: '🗽', color: 'navy',
      date: 'Feb 21, 2026, 02:05 AM', ts: Date.now() - 1000 * 3600 * 72,
    },
    {
      id: 5, author: 'Hana 🌸', to: 'The whole group',
      message: "Nashville honky-tonks, cowboy hats, live music every corner 🎸 I didn't expect to love country music but here we are!",
      sticker: '🎸', color: 'red',
      date: 'Feb 20, 2026, 10:22 PM', ts: Date.now() - 1000 * 3600 * 96,
    },
  ];
}
