/* ============================================================
   Diva Dynamic Yoga — Main JavaScript
   ============================================================ */

// ── Navbar scroll behavior ─────────────────────────────────
const navbar = document.getElementById('navbar');
const isHome = document.body.dataset.page === 'home';

function updateNavbar() {
  if (!navbar) return;
  if (isHome) {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('transparent');
    }
  } else {
    navbar.classList.add('scrolled');
    navbar.classList.remove('transparent');
  }
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

// ── Hamburger / Mobile drawer ──────────────────────────────
const hamburger = document.getElementById('hamburger');
const navDrawer = document.getElementById('navDrawer');

if (hamburger && navDrawer) {
  hamburger.addEventListener('click', () => {
    const isOpen = navDrawer.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close drawer when a link is clicked
  navDrawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navDrawer.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && !navDrawer.contains(e.target)) {
      navDrawer.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
}

// ── Active nav link ────────────────────────────────────────
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (link.href === window.location.href || 
      (href && href !== '/' && currentPath.endsWith(href)) ||
      (href === '/' && (currentPath === '/' || currentPath.endsWith('/index.html')))) {
    link.classList.add('active');
  }
});

// ── Scroll reveal ──────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Booking Modal ──────────────────────────────────────────
const modalOverlay = document.getElementById('bookingModal');
const modalForm    = document.getElementById('bookingForm');

function openModal() {
  if (modalOverlay) {
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus first input
    setTimeout(() => {
      const first = modalOverlay.querySelector('input');
      if (first) first.focus();
    }, 100);
  }
}

function closeModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// All "book" buttons open the modal
document.querySelectorAll('[data-book]').forEach(btn => {
  btn.addEventListener('click', openModal);
});

// Close on overlay click
if (modalOverlay) {
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
}

// ESC key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── Booking Form Submission Helper ─────────────────────────
async function submitBooking(data, formEl, isModal = false) {
  if (!data.name || !data.phone) {
    showToast('Please enter your name and phone number.', 'error');
    return;
  }

  const btn = formEl.querySelector('[type=submit]');
  const origText = btn ? btn.textContent : 'Confirm';
  if (btn) {
    btn.textContent = 'Sending…';
    btn.disabled = true;
  }

  try {
    let successMessage = `Thank you ${data.name}! We'll reach out on ${data.phone} shortly to confirm your slot.`;
    
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.message) successMessage = json.message;
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error) {
          showToast(errJson.error, 'error');
          return;
        }
      }
    } catch (netErr) {
      // Backend server not running / static mode -> store in localStorage
      const existing = JSON.parse(localStorage.getItem('diva_bookings') || '[]');
      existing.push({ ...data, timestamp: new Date().toISOString() });
      localStorage.setItem('diva_bookings', JSON.stringify(existing));
    }

    if (isModal) closeModal();
    showToast(successMessage, 'success');
    formEl.reset();

  } catch (err) {
    showToast('Could not process booking. Please call us directly at +91 73053 82804.', 'error');
  } finally {
    if (btn) {
      btn.textContent = origText;
      btn.disabled = false;
    }
  }
}

// ── Booking Form Submit (Modal) ─────────────────────────────
if (modalForm) {
  modalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name:    modalForm.querySelector('#bName')?.value?.trim() || '',
      phone:   modalForm.querySelector('#bPhone')?.value?.trim() || '',
      email:   modalForm.querySelector('#bEmail')?.value?.trim() || '',
      message: modalForm.querySelector('#bMessage')?.value?.trim() || '',
    };
    submitBooking(data, modalForm, true);
  });
}

// Contact page form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name:           contactForm.querySelector('#cName')?.value?.trim() || '',
      phone:          contactForm.querySelector('#cPhone')?.value?.trim() || '',
      email:          contactForm.querySelector('#cEmail')?.value?.trim() || '',
      class_interest: contactForm.querySelector('#cClass')?.value || '',
      message:        contactForm.querySelector('#cMessage')?.value?.trim() || '',
    };
    submitBooking(data, contactForm, false);
  });
}

// ── Toast notification ─────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.classList.remove('show'); }, 4500);
}

// ── Smooth counter animation ───────────────────────────────
function animateCounter(el, target, duration = 1400) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target) + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      if (!isNaN(target)) animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ── Schedule tab filter (schedule page) ───────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
