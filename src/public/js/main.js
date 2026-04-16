(function () {
  // Cleanup for clients that still have an older PWA service worker after rollback.
  async function clearLegacyServiceWorkerState() {
    if (!('serviceWorker' in navigator)) return;

    const cleanupKey = 'whale_legacy_sw_cleanup_v1';
    if (window.localStorage && localStorage.getItem(cleanupKey) === 'done') return;

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }

      if (window.localStorage) localStorage.setItem(cleanupKey, 'done');
    } catch (_error) {
      // Best effort cleanup only; ignore failures to avoid disrupting navigation.
    }
  }

  clearLegacyServiceWorkerState();

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    document.addEventListener('click', function (event) {
      const clickedInsideMenu = navLinks.contains(event.target);
      const clickedHamburger = hamburger.contains(event.target);
      if (!clickedInsideMenu && !clickedHamburger) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });

    navLinks.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }
})();

(function () {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  let overlay = document.getElementById('sidebarOverlay');
  if (!overlay) {
    overlay = document.createElement('button');
    overlay.type = 'button';
    overlay.id = 'sidebarOverlay';
    overlay.className = 'sidebar-overlay';
    overlay.setAttribute('aria-label', 'Close sidebar');
    document.body.appendChild(overlay);
  }

  function setSidebarVisibility(show) {
    sidebar.classList.toggle('visible', show);
    sidebar.classList.toggle('active', show);
    overlay.classList.toggle('visible', show);
    overlay.hidden = !show;
    document.body.classList.toggle('sidebar-open', show);
  }

  function closeSidebar() {
    setSidebarVisibility(false);
  }

  window.toggleSidebar = function toggleSidebar() {
    const show = !sidebar.classList.contains('visible');
    setSidebarVisibility(show);
  };

  overlay.addEventListener('click', closeSidebar);

  sidebar.addEventListener('click', function (event) {
    if (event.target.closest('a')) {
      closeSidebar();
    }
  });

  window.addEventListener('pageshow', closeSidebar);

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });

  closeSidebar();
})();

function toggleSidebar() {
  if (typeof window.toggleSidebar === 'function') {
    window.toggleSidebar();
  }
}

function copyTextValue(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  navigator.clipboard.writeText(el.value || el.textContent || '');
  alert('Copied successfully');
}
