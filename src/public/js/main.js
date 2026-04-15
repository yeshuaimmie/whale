(function () {
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
    document.body.classList.toggle('sidebar-open', show);
  }

  window.toggleSidebar = function toggleSidebar() {
    const show = !sidebar.classList.contains('visible');
    setSidebarVisibility(show);
  };

  overlay.addEventListener('click', function () {
    setSidebarVisibility(false);
  });

  sidebar.addEventListener('click', function (event) {
    if (event.target.closest('a')) {
      setSidebarVisibility(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setSidebarVisibility(false);
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      setSidebarVisibility(false);
    }
  });
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

(function () {
  const PASSWORD_READY_ATTR = 'data-password-toggle-ready';

  function attachPasswordToggles() {
    const passwordInputs = document.querySelectorAll('input[type="password"]:not([' + PASSWORD_READY_ATTR + '])');

    passwordInputs.forEach(function (input) {
      input.setAttribute(PASSWORD_READY_ATTR, 'true');

      if (input.parentElement && input.parentElement.classList.contains('password-field-wrap')) {
        return;
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'password-field-wrap';

      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'password-toggle';
      toggleBtn.setAttribute('aria-label', 'Show password');
      toggleBtn.setAttribute('aria-pressed', 'false');
      toggleBtn.textContent = 'Show';

      toggleBtn.addEventListener('click', function () {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        toggleBtn.textContent = isPassword ? 'Hide' : 'Show';
        toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        toggleBtn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
      });

      wrapper.appendChild(toggleBtn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachPasswordToggles);
  } else {
    attachPasswordToggles();
  }
})();
