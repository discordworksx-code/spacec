(() => {
  const API = '/api';
  const apply = (theme) => {
    document.documentElement.dataset.theme = theme === 'ios' ? 'ios' : 'app';
    document.querySelectorAll('[data-theme-choice]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.themeChoice === document.documentElement.dataset.theme);
    });
  };
  async function sync() {
    try {
      const response = await fetch(`${API}/system/config`, { cache: 'no-store' });
      const data = await response.json();
      apply(data?.config?.app_theme || 'app');
    } catch {}
  }
  function mountAdminControl() {
    if (!location.pathname.toLowerCase().includes('admin') || document.querySelector('[data-space-theme-switcher]')) return;
    const switcher = document.createElement('div');
    switcher.dataset.spaceThemeSwitcher = 'true';
    switcher.className = 'space-theme-runtime';
    switcher.innerHTML = '<span>Theme</span><button data-theme-choice="app">App</button><button data-theme-choice="ios">iOS</button>';
    switcher.addEventListener('click', async (event) => {
      const theme = event.target.dataset.themeChoice;
      if (!theme) return;
      apply(theme);
      try {
        await fetch(`${API}/admin/system-config`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('space_admin_token') || ''}` },
          body: JSON.stringify({ app_theme: theme })
        });
      } catch {}
    });
    document.body.appendChild(switcher);
    apply(document.documentElement.dataset.theme);
  }
  sync();
  setInterval(sync, 10000);
  setTimeout(mountAdminControl, 1200);
  new MutationObserver(mountAdminControl).observe(document.documentElement, { childList: true, subtree: true });
})();