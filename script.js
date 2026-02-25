// =====================
// ⚙️ JSONBin.io 설정
// 아래 두 값을 본인 것으로 교체하세요!
// =====================
const JSONBIN_API_KEY  = 'YOUR_API_KEY_HERE';   // JSONBin.io X-Access-Key
const JSONBIN_BIN_ID   = 'YOUR_BIN_ID_HERE';    // Bin ID

const JSONBIN_BASE_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// =====================
// State
// =====================
let messages       = [];
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
const modalClose   = document.getElementById('modalClose');
const modalSticker = document.getElementById('modalSticker');
const modalTo      = document.getElementById('modalTo');
const modalAuthor  = document.getElementById('modalAuthor');
const modalMessage = document.getElementById('modalMessage');
const modalDate    = document.getElementById('modalDate');
const toast        = document.getElementById('toast');
const particles    = document.getElementById('particles');

// =====================
// JSONBin API
// =====================
async function fetchMessages() {
  try {
    const res = await fetch(JSONBIN_BASE_URL + '/latest', {
      headers: { 'X-Access-Key': JSONBIN_API_KEY }
    });
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    return data.record.messages || [];
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
        'X-Access-Key': JSONBIN_API_KEY,
      },
      body: JSON.stringify({ messages: msgs }),
    });
    if (!res.ok) throw new Error('Save failed');
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
  document.querySelector('.char-count').style.color = len >= 200 ? '#c0392b' : '#c0c0d8';
});

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

  // 낙관적 업데이트: 화면 먼저 반영
  messages.unshift(newMsg);
  renderBoard(true);
  authorInput.value  = '';
  toInput.value      = '';
  messageInput.value = '';
  charCount.textContent = '0';
  burstParticles();

  // 서버에 저장
  setLoading(true);
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
// Render Board
// =====================
function renderBoard(isNew = false) {
  Array.from(board.children).forEach(child => {
    if (!child.classList.contains('empty-state')) child.remove();
  });

  let list = [...messages];
  if (currentFilter === 'recent') {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    list = list.filter(m => m.ts && m.ts > cutoff);
  }

  if (list.length === 0) {
    emptyState.style.display = 'block';
    messageCount.textContent = '0 messages';
    return;
  }

  emptyState.style.display = 'none';
  messageCount.textContent = `${messages.length} message${messages.length !== 1 ? 's' : ''}`;

  list.forEach((msg, idx) => {
    const card = createCard(msg, isNew && idx === 0);
    board.insertBefore(card, emptyState);
  });
}

function createCard(msg, isNew = false) {
  const card = document.createElement('div');
  card.className = `message-card color-${msg.color}${isNew ? ' new' : ''}`;
  card.innerHTML = `
    <div class="card-sticker">${msg.sticker}</div>
    ${msg.to ? `<div class="card-to">To: ${escapeHtml(msg.to)}</div>` : ''}
    <div class="card-author">From: ${escapeHtml(msg.author)}</div>
    <div class="card-preview">${escapeHtml(msg.message)}</div>
    <div class="card-date">${msg.date}</div>
  `;
  card.addEventListener('click', () => openModal(msg));
  return card;
}

// =====================
// Modal
// =====================
function openModal(msg) {
  modalSticker.textContent = msg.sticker;
  modalTo.textContent      = msg.to ? `To: ${msg.to}` : '';
  modalAuthor.textContent  = `From: ${msg.author}`;
  modalMessage.textContent = msg.message;
  modalDate.textContent    = msg.date;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// =====================
// Loading State
// =====================
function setLoading(state) {
  isLoading = state;
  submitBtn.disabled = state;
  submitBtn.querySelector('span').textContent = state ? 'Saving...' : 'Post Your Message!';
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

// Shake keyframe injection
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-8px); }
    40%       { transform: translateX(8px); }
    60%       { transform: translateX(-5px); }
    80%       { transform: translateX(5px); }
  }
`;
document.head.appendChild(styleEl);

// =====================
// 🚀 Init — JSONBin에서 데이터 로드
// =====================
(async () => {
  // 설정이 안 된 경우 localStorage fallback
  if (JSONBIN_API_KEY === 'YOUR_API_KEY_HERE' || JSONBIN_BIN_ID === 'YOUR_BIN_ID_HERE') {
    console.warn('⚠️ JSONBin API key / Bin ID not set. Using localStorage fallback.');
    messages = JSON.parse(localStorage.getItem('usaTripMessages') || '[]');

    // 샘플 데이터 (처음 방문 시)
    if (messages.length === 0) {
      messages = getSampleData();
      localStorage.setItem('usaTripMessages', JSON.stringify(messages));
    }

    renderBoard();
    return;
  }

  // 로딩 표시
  board.innerHTML = `
    <div class="empty-state" id="emptyState">
      <div class="empty-icon" style="animation: spin 1s linear infinite; display:inline-block;">⏳</div>
      <p>Loading messages...</p>
    </div>
  `;

  const styleLoad = document.createElement('style');
  styleLoad.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(styleLoad);

  messages = await fetchMessages();

  // 샘플 데이터 (처음 배포 시 빈 경우)
  if (messages.length === 0) {
    messages = getSampleData();
    await saveMessages(messages);
  }

  board.innerHTML = '';
  board.appendChild(document.getElementById('emptyState') || createEmptyState());
  renderBoard();
})();

function createEmptyState() {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.id = 'emptyState';
  div.innerHTML = `<div class="empty-icon">📭</div><p>No messages yet.<br/>Be the first one to leave a note!</p>`;
  return div;
}

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
