/* ============================================
   JARINRAKSA OY — main.js
   ============================================ */

'use strict';

/* ---------- NAVIGAATIO: SCROLL-EFEKTI ---------- */
const header = document.querySelector('.site-header');

function handleHeaderScroll() {
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();


/* ---------- HAMPURILAISVALIKKO ---------- */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.getAttribute('aria-expanded') === 'true';

  hamburger.setAttribute('aria-expanded', String(!isOpen));

  if (isOpen) {
    mobileMenu.hidden = true;
  } else {
    mobileMenu.hidden = false;
  }
});

// Sulje mobiilivalikko linkkiä klikatessa
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.hidden = true;
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Sulje mobiilivalikko ESC-näppäimellä
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !mobileMenu.hidden) {
    mobileMenu.hidden = true;
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.focus();
  }
});

// Sulje mobiilivalikko klikatessa sen ulkopuolelle
document.addEventListener('click', e => {
  if (
    !mobileMenu.hidden &&
    !mobileMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    mobileMenu.hidden = true;
    hamburger.setAttribute('aria-expanded', 'false');
  }
});


/* ---------- SCROLL REVEAL ---------- */
const revealElements = document.querySelectorAll(
  '.palvelu-kortti, .galleria-item, .trust-item, .meista-teksti, .meista-kuva-wrapper, .palvelut-extra, .tarjous-info, .lomake-wrapper'
);

// Lisää reveal-luokka ja mahdolliset delay-luokat
revealElements.forEach((el, i) => {
  el.classList.add('reveal');

  // Delay grid-elementeille (kortit, galleriaruudut, trust-itemit)
  const isGridChild =
    el.classList.contains('palvelu-kortti') ||
    el.classList.contains('galleria-item') ||
    el.classList.contains('trust-item');

  if (isGridChild) {
    const siblings = el.parentElement.querySelectorAll(':scope > *');
    const idx = Array.from(siblings).indexOf(el);
    const delayNum = (idx % 4) + 1;
    el.classList.add(`reveal-delay-${delayNum}`);
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  }
);

revealElements.forEach(el => revealObserver.observe(el));


/* ---------- HERO: PARALLAX ---------- */
const heroBgImg = document.querySelector('.hero-bg-img');

function handleParallax() {
  if (!heroBgImg) return;
  const scrolled = window.scrollY;
  // Kevyt parallax, ei häiritse suorituskykyä
  heroBgImg.style.transform = `scale(1.04) translateY(${scrolled * 0.18}px)`;
}

// Aktivoi vain jos ei ole reduced motion -asetus
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!prefersReducedMotion.matches) {
  window.addEventListener('scroll', handleParallax, { passive: true });
}


/* ---------- LOMAKE: LÄHETYS ---------- */
const form = document.getElementById('tarjous-lomake');
const formStatus = document.getElementById('form-status');

function showStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;

  // Vieritä statuksen kohdalle mobiilissa
  formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearStatus() {
  formStatus.textContent = '';
  formStatus.className = 'form-status';
}

function setFormLoading(isLoading) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Lähetetään...';
    submitBtn.style.opacity = '0.7';
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Lähetä tarjouspyyntö';
    submitBtn.style.opacity = '';
  }
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  clearStatus();

  // Validoi kentät
  const nimi = form.querySelector('#nimi').value.trim();
  const puhelin = form.querySelector('#puhelin').value.trim();
  const viesti = form.querySelector('#viesti').value.trim();

  if (!nimi) {
    showStatus('Kirjoita nimesi.', 'error');
    form.querySelector('#nimi').focus();
    return;
  }

  if (!puhelin) {
    showStatus('Kirjoita puhelinnumerosi.', 'error');
    form.querySelector('#puhelin').focus();
    return;
  }

  if (!viesti) {
    showStatus('Kuvaile lyhyesti remonttisi.', 'error');
    form.querySelector('#viesti').focus();
    return;
  }

  setFormLoading(true);

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    if (response.ok) {
      showStatus('Tarjouspyyntö lähetetty. Palaamme sinulle 24 tunnin sisällä.', 'success');
      form.reset();
    } else {
      const data = await response.json().catch(() => ({}));
      if (data.errors) {
        showStatus('Lähetys epäonnistui: ' + data.errors.map(err => err.message).join(', '), 'error');
      } else {
        showStatus('Lähetys epäonnistui. Soita meille: 040 0450902', 'error');
      }
    }
  } catch {
    showStatus('Verkkovirhe. Soita meille: 040 0450902', 'error');
  } finally {
    setFormLoading(false);
  }
});

// Tyhjennä kentän virhekorostus kun käyttäjä alkaa kirjoittaa
form.querySelectorAll('input, textarea, select').forEach(field => {
  field.addEventListener('input', () => {
    if (formStatus.classList.contains('error')) {
      clearStatus();
    }
  });
});


/* ---------- NAVIGAATIOLINKIT: AKTIIVINEN TILA ---------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.removeAttribute('aria-current');
          if (link.getAttribute('href') === `#${id}`) {
            link.setAttribute('aria-current', 'page');
          }
        });
      }
    });
  },
  {
    threshold: 0.4,
    rootMargin: '-72px 0px 0px 0px'
  }
);

sections.forEach(section => sectionObserver.observe(section));


/* ---------- GALLERIARUUDUT: LIGHTBOX-EFEKTI ---------- */
const galleryItems = document.querySelectorAll('.galleria-item img');

// Luo lightbox-elementit
const lightbox = document.createElement('div');
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.setAttribute('aria-label', 'Kuvan suurennus');
lightbox.id = 'lightbox';
lightbox.style.cssText = `
  display: none;
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(10, 18, 35, 0.95);
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  padding: 2rem;
  backdrop-filter: blur(8px);
`;

const lightboxImg = document.createElement('img');
lightboxImg.style.cssText = `
  max-width: min(90vw, 960px);
  max-height: 85vh;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  border: 1px solid rgba(201, 168, 76, 0.2);
`;

const lightboxClose = document.createElement('button');
lightboxClose.setAttribute('aria-label', 'Sulje kuva');
lightboxClose.style.cssText = `
  position: absolute;
  top: 1.2rem;
  right: 1.4rem;
  background: rgba(201, 168, 76, 0.15);
  border: 1px solid rgba(201, 168, 76, 0.35);
  color: #f5edd6;
  font-size: 1.5rem;
  line-height: 1;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
`;
lightboxClose.innerHTML = '&times;';
lightboxClose.addEventListener('mouseenter', () => {
  lightboxClose.style.background = 'rgba(201, 168, 76, 0.35)';
});
lightboxClose.addEventListener('mouseleave', () => {
  lightboxClose.style.background = 'rgba(201, 168, 76, 0.15)';
});

lightbox.appendChild(lightboxImg);
lightbox.appendChild(lightboxClose);
document.body.appendChild(lightbox);

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.style.display = 'none';
  lightboxImg.src = '';
  document.body.style.overflow = '';
}

galleryItems.forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => openLightbox(img.src, img.alt));

  // Keyboard tuki
  img.setAttribute('tabindex', '0');
  img.setAttribute('role', 'button');
  img.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(img.src, img.alt);
    }
  });
});

lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lightbox.style.display === 'flex') {
    closeLightbox();
  }
});


/* ---------- SMOOTH SCROLL ANKKURILINKEILLE ---------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const headerHeight = header.offsetHeight;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});