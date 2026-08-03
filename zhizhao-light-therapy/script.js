const header = document.getElementById('header');
const menuBtn = document.getElementById('menu-btn');
const siteNav = document.getElementById('site-nav');

const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

menuBtn.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  menuBtn.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

siteNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    menuBtn.classList.remove('active');
    document.body.style.overflow = '';
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('.card-expandable').forEach(card => {
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-expanded', 'false');

  const toggleCard = () => {
    const expanded = card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', String(expanded));
  };

  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button, video')) return;
    toggleCard();
  });

  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleCard();
    }
  });
});

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// Particle system
(function() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = 40;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    const size = Math.random() * 2.5 + 1;
    dot.style.cssText = `
      position:absolute;width:${size}px;height:${size}px;border-radius:50%;
      background:rgba(6,182,212,${Math.random() * .35 + .1});
      left:${Math.random() * 100}%;top:${Math.random() * 100}%;
      animation: drift ${Math.random() * 14 + 10}s linear infinite;
      animation-delay:${Math.random() * 8}s;
    `;
    frag.appendChild(dot);
  }
  container.appendChild(frag);
  const style = document.createElement('style');
  style.textContent = '@keyframes drift{0%{transform:translate(0,0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translate(' +
    (Math.random() * 80 - 40) + 'px,' + (Math.random() * -120 - 20) + 'px);opacity:0}';
  container.appendChild(style);
})();
