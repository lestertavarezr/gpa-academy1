// Envelope intro
const envelopeScreen = document.getElementById('envelope-screen');
const envelopeWrap = document.getElementById('envelopeWrap');
const main = document.getElementById('main');

envelopeWrap.addEventListener('click', () => {
  if (envelopeWrap.classList.contains('open')) return;
  envelopeWrap.classList.add('open');
  setTimeout(() => {
    envelopeScreen.classList.add('hidden');
    main.classList.add('show');
    document.body.style.overflow = 'auto';
  }, 750);
});

document.body.style.overflow = 'hidden';

// Countdown
const WEDDING_DATE = new Date('2026-12-26T16:00:00-04:00').getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, WEDDING_DATE - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Fade-in on scroll
const fadeEls = document.querySelectorAll('.fade-in');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });
fadeEls.forEach((el) => io.observe(el));

// Active nav dot
const sections = document.querySelectorAll('section[id]');
const dots = document.querySelectorAll('.nav-dots a');
const navIo = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const dot = document.querySelector(`.nav-dots a[href="#${entry.target.id}"]`);
    if (!dot) return;
    if (entry.isIntersecting) {
      dots.forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
    }
  });
}, { threshold: 0.5 });
sections.forEach((s) => navIo.observe(s));
