(function () {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }
})();

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('active');
}

function copyTextValue(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  navigator.clipboard.writeText(el.value || el.textContent || '');
  alert('Copied successfully');
}
