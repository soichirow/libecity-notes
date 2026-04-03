

// ===== SLIDES =====
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
// URLハッシュからスライド位置を復元 (#slide=10 など)
function getSavedSlide() {
  const hash = location.hash.match(/slide=(\d+)/);
  if (hash) return parseInt(hash[1], 10);
  return 0;
}
let savedSlide = getSavedSlide();
if (savedSlide >= totalSlides || savedSlide < 0) savedSlide = 0;
slides.forEach(s => s.classList.remove('active'));
let currentSlide = savedSlide;
slides[currentSlide].classList.add('active');
document.getElementById('pageInfo').textContent = (currentSlide + 1) + ' / ' + totalSlides;
document.getElementById('pageNumber').textContent = (currentSlide + 1) + ' / ' + totalSlides;
document.getElementById('progressBar').style.width = ((currentSlide + 1) / totalSlides * 100) + '%';
function showSlide(n) {
  slides[currentSlide].classList.remove('active');
  currentSlide = (n + totalSlides) % totalSlides;
  slides[currentSlide].classList.add('active');
  document.getElementById('pageInfo').textContent = (currentSlide + 1) + ' / ' + totalSlides;
  document.getElementById('pageNumber').textContent = (currentSlide + 1) + ' / ' + totalSlides;
  document.getElementById('progressBar').style.width = ((currentSlide + 1) / totalSlides * 100) + '%';
  history.replaceState(null, '', '#slide=' + currentSlide);
}
function nextSlide() { showSlide(currentSlide + 1); }
function prevSlide() { showSlide(currentSlide - 1); }
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
});
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
// Click outside to close
document.addEventListener('click', (e) => {
  const nav = document.querySelector('.nav');
  if (!nav.contains(e.target)) {
    document.getElementById('navPanel').classList.remove('open');
  }
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

// ===== DRAG TIMER =====
let isDragging = false, dragOffX = 0, dragOffY = 0;
timerFloat.addEventListener('mousedown', (e) => {
  if (e.target.tagName === 'BUTTON') return;
  isDragging = true;
  dragOffX = e.clientX - timerFloat.getBoundingClientRect().left;
  dragOffY = e.clientY - timerFloat.getBoundingClientRect().top;
  timerFloat.style.transition = 'none';
});
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  timerFloat.style.left = (e.clientX - dragOffX) + 'px';
  timerFloat.style.top = (e.clientY - dragOffY) + 'px';
  timerFloat.style.right = 'auto';
  timerFloat.style.bottom = 'auto';
});
document.addEventListener('mouseup', () => { isDragging = false; });
// Touch drag
timerFloat.addEventListener('touchstart', (e) => {
  if (e.target.tagName === 'BUTTON') return;
  isDragging = true;
  const t = e.touches[0];
  dragOffX = t.clientX - timerFloat.getBoundingClientRect().left;
  dragOffY = t.clientY - timerFloat.getBoundingClientRect().top;
  timerFloat.style.transition = 'none';
});
document.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const t = e.touches[0];
  timerFloat.style.left = (t.clientX - dragOffX) + 'px';
  timerFloat.style.top = (t.clientY - dragOffY) + 'px';
  timerFloat.style.right = 'auto';
  timerFloat.style.bottom = 'auto';
});
document.addEventListener('touchend', () => { isDragging = false; });
