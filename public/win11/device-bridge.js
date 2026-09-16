(() => {
  const params = new URLSearchParams(window.location.search);
  const deviceId = params.get('deviceId');
  if (!deviceId) return;

  const openedAt = Date.now();
  const POLL_MS = 700;
  const MAX_LINES = 100;
  const seen = new Set();
  let initialized = false;
  let polling = false;
  let deviceName = params.get('name') || 'Windows 11';

  const shell = document.createElement('section');
  shell.id = 'space-device-terminal';
  shell.setAttribute('aria-live', 'polite');
  shell.innerHTML = `
    <header class="space-terminal__bar">
      <div class="space-terminal__identity">
        <span class="space-terminal__icon" aria-hidden="true">›_</span>
        <div>
          <strong>Remote Terminal</strong>
          <small data-terminal-device-name></small>
        </div>
      </div>
      <div class="space-terminal__actions">
        <button type="button" data-terminal-minimize aria-label="Minimize terminal">—</button>
        <button type="button" data-terminal-close aria-label="Close terminal">×</button>
      </div>
    </header>
    <div class="space-terminal__body" data-terminal-output>
      <p class="space-terminal__muted">Microsoft Windows [Version 10.0.22631]</p>
      <p class="space-terminal__muted">Secure device channel: ${escapeHtml(deviceId)}</p>
    </div>
  `;
  document.body.appendChild(shell);

  const bar = shell.querySelector('.space-terminal__bar');
  const output = shell.querySelector('[data-terminal-output]');
  const nameLabel = shell.querySelector('[data-terminal-device-name]');
  nameLabel.textContent = `${deviceName} · isolated session`;

  shell.querySelector('[data-terminal-close]').addEventListener('click', () => shell.classList.remove('is-open'));
  shell.querySelector('[data-terminal-minimize]').addEventListener('click', () => shell.classList.toggle('is-minimized'));
  bar.addEventListener('dblclick', (event) => {
    if (!event.target.closest('button')) shell.classList.toggle('is-minimized');
  });

  let drag = null;
  bar.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('button')) return;
    const rect = shell.getBoundingClientRect();
    drag = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    shell.style.left = `${rect.left}px`;
    shell.style.top = `${rect.top}px`;
    shell.style.bottom = 'auto';
    shell.style.transform = 'none';
    shell.classList.add('is-dragging');
    bar.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  bar.addEventListener('pointermove', (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const maxLeft = Math.max(8, window.innerWidth - shell.offsetWidth - 8);
    const maxTop = Math.max(8, window.innerHeight - shell.offsetHeight - 8);
    shell.style.left = `${Math.min(maxLeft, Math.max(8, event.clientX - drag.offsetX))}px`;
    shell.style.top = `${Math.min(maxTop, Math.max(8, event.clientY - drag.offsetY))}px`;
  });
  const stopDragging = (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag = null;
    shell.classList.remove('is-dragging');
    try { bar.releasePointerCapture(event.pointerId); } catch {}
  };
  bar.addEventListener('pointerup', stopDragging);
  bar.addEventListener('pointercancel', stopDragging);

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  }

  function syncSystemName(root = document.body) {
    if (!root || !deviceName) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const matches = [];
    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue?.trim() === 'Liber-V') matches.push(walker.currentNode);
    }
    matches.forEach((node) => { node.nodeValue = node.nodeValue.replace('Liber-V', deviceName); });
  }

  const nameObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim() === 'Liber-V') node.nodeValue = deviceName;
        else if (node.nodeType === Node.ELEMENT_NODE) syncSystemName(node);
      });
    }
  });
  nameObserver.observe(document.body, { childList: true, subtree: true });
  syncSystemName();

  async function refreshDeviceConfig() {
    try {
      const response = await fetch(`/api/devices/${encodeURIComponent(deviceId)}/config`, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (data.device?.name) {
        deviceName = data.device.name;
        nameLabel.textContent = `${deviceName} · isolated session`;
        syncSystemName();
      }
    } catch {}
  }

  function addMessage(message) {
    if (!message || !message.id || seen.has(message.id)) return false;
    seen.add(message.id);
    const row = document.createElement('div');
    row.className = 'space-terminal__line';
    const prompt = document.createElement('span');
    prompt.className = 'space-terminal__prompt';
    prompt.textContent = 'C:\\Users\\Remote>';
    const command = document.createElement('span');
    command.className = 'space-terminal__command';
    command.textContent = message.text || '';
    const meta = document.createElement('small');
    meta.className = 'space-terminal__meta';
    const time = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '';
    meta.textContent = `${message.from || 'Operator'}${time ? ` · ${time}` : ''}`;
    row.append(prompt, command, meta);
    output.appendChild(row);
    while (output.querySelectorAll('.space-terminal__line').length > MAX_LINES) output.querySelector('.space-terminal__line')?.remove();
    output.scrollTop = output.scrollHeight;
    return true;
  }

  async function poll() {
    if (polling) return;
    polling = true;
    try {
      const response = await fetch(`/api/devices/${encodeURIComponent(deviceId)}/typing`, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const messages = Array.isArray(data.messages) ? data.messages : [];
      let hasNew = false;
      if (!initialized) {
        messages.forEach((message) => {
          const sentAt = message.timestamp ? new Date(message.timestamp).getTime() : 0;
          if (sentAt >= openedAt) hasNew = addMessage(message) || hasNew;
          else if (message.id) seen.add(message.id);
        });
        initialized = true;
      } else {
        messages.forEach((message) => { hasNew = addMessage(message) || hasNew; });
      }
      if (hasNew) {
        shell.classList.add('is-open');
        shell.classList.remove('is-minimized');
      }
      shell.classList.remove('is-disconnected');
    } catch {
      shell.classList.add('is-disconnected');
    } finally {
      polling = false;
    }
  }

  refreshDeviceConfig();
  poll();
  const timer = window.setInterval(poll, POLL_MS);
  window.addEventListener('beforeunload', () => {
    window.clearInterval(timer);
    nameObserver.disconnect();
  });
  window.addEventListener('focus', poll);
})();
