// ===== SLIDES =====
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const pageInfoEl = document.getElementById('pageInfo');
const pageNumberEl = document.getElementById('pageNumber');
const progressBarEl = document.getElementById('progressBar');

function getSavedSlide() {
  const hash = location.hash.match(/slide=(\d+)/);
  return hash ? parseInt(hash[1], 10) : 0;
}

function updateSlideUI() {
  const label = (currentSlide + 1) + ' / ' + totalSlides;
  pageInfoEl.textContent = label;
  pageNumberEl.textContent = label;
  progressBarEl.style.width = ((currentSlide + 1) / totalSlides * 100) + '%';
}

let currentSlide = Math.min(Math.max(getSavedSlide(), 0), totalSlides - 1);
slides.forEach(s => s.classList.remove('active'));
slides[currentSlide].classList.add('active');
updateSlideUI();

function showSlide(n) {
  slides[currentSlide].classList.remove('active');
  currentSlide = (n + totalSlides) % totalSlides;
  slides[currentSlide].classList.add('active');
  updateSlideUI();
  history.replaceState(null, '', '#slide=' + currentSlide);
}

function nextSlide() { showSlide(currentSlide + 1); }
function prevSlide() { showSlide(currentSlide - 1); }

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
});

// Swipe navigation
let touchStartX = 0;
document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
document.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
});

showSlide(currentSlide);

// ===== NAV TOGGLE =====
function toggleNav() {
  document.getElementById('navPanel').classList.toggle('open');
}

document.addEventListener('click', (e) => {
  const nav = document.querySelector('.nav');
  if (!nav.contains(e.target)) {
    document.getElementById('navPanel').classList.remove('open');
  }
});

// ===== COPY TO CLIPBOARD =====
function copyText(text) {
  // textarea fallback (works on HTTP with user gesture)
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  // Also try clipboard API (works on HTTPS)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

document.querySelectorAll('.copyable[data-copy]').forEach(card => {
  card.addEventListener('click', () => {
    copyText(card.dataset.copy);
    card.classList.add('copied');
    const badge = card.querySelector('.copy-badge');
    if (badge) badge.textContent = 'コピーしました';
    setTimeout(() => {
      card.classList.remove('copied');
      if (badge) badge.textContent = 'クリックでコピーできます';
    }, 1500);
  });
});

// ===== TIMER =====
let timerInterval = null;
let timerSeconds = 0;
const timerFloat = document.getElementById('timerFloat');
const timerDisplay = document.getElementById('timerDisplay');

function startTimer(secs) {
  if (!secs || secs <= 0) return;
  stopTimer();
  timerSeconds = secs;
  timerFloat.classList.add('active');
  document.getElementById('navPanel').classList.remove('open');
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay();
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerDisplay.textContent = "0:00 !";
      timerDisplay.classList.add('warning');
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerFloat.classList.remove('active');
  timerDisplay.classList.remove('warning');
}

function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  timerDisplay.textContent = m + ':' + String(s).padStart(2, '0');
  timerDisplay.classList.toggle('warning', timerSeconds <= 10 && timerSeconds > 0);
}

// ===== DRAG TIMER (unified mouse + touch) =====
let isDragging = false, dragOffX = 0, dragOffY = 0;

function onDragStart(clientX, clientY) {
  isDragging = true;
  const rect = timerFloat.getBoundingClientRect();
  dragOffX = clientX - rect.left;
  dragOffY = clientY - rect.top;
  timerFloat.style.transition = 'none';
}

function onDragMove(clientX, clientY) {
  if (!isDragging) return;
  timerFloat.style.left = (clientX - dragOffX) + 'px';
  timerFloat.style.top = (clientY - dragOffY) + 'px';
  timerFloat.style.right = 'auto';
  timerFloat.style.bottom = 'auto';
}

function onDragEnd() { isDragging = false; }

timerFloat.addEventListener('mousedown', (e) => {
  if (e.target.tagName === 'BUTTON') return;
  onDragStart(e.clientX, e.clientY);
});
document.addEventListener('mousemove', (e) => onDragMove(e.clientX, e.clientY));
document.addEventListener('mouseup', onDragEnd);

timerFloat.addEventListener('touchstart', (e) => {
  if (e.target.tagName === 'BUTTON') return;
  onDragStart(e.touches[0].clientX, e.touches[0].clientY);
});
document.addEventListener('touchmove', (e) => {
  if (isDragging) onDragMove(e.touches[0].clientX, e.touches[0].clientY);
});
document.addEventListener('touchend', onDragEnd);
