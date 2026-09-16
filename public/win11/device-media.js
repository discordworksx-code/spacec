(() => {
  const params = new URLSearchParams(location.search);
  const deviceId = params.get("deviceId");
  const viewMode = params.get("mode") === "live" ? "live" : "vm";
  if (!deviceId) return;

  let lastMedia = null;
  let appsSignature = "";
  let currentName = params.get("name") || "Liber-V";
  const positions = JSON.parse(
    localStorage.getItem(`space-app-positions:${deviceId}`) || "{}",
  );
  const layer = document.createElement("div");
  layer.id = "space-custom-apps";
  document.body.appendChild(layer);
  const menu = document.createElement("div");
  menu.id = "space-app-context";
  menu.innerHTML =
    '<button data-action="open"><i>↗</i>Open</button><button><i>🛡️</i>Run as administrator</button><button><i>📂</i>Open file location</button><button><i>📌</i>Unpin from Start</button><button><i>🗜️</i>Compress to Zip file</button><button><i>📋</i>Copy as path</button><button><i>⚙️</i>Properties</button><hr><button data-action="delete"><i>🗑️</i>Delete shortcut</button><button data-action="delete"><i>🗑️</i>Delete</button>';
  document.body.appendChild(menu);
  let menuApp = null;

  async function removeApp(app, el) {
    await fetch(
      `/api/devices/${encodeURIComponent(deviceId)}/custom-apps/${encodeURIComponent(app.id)}`,
      { method: "DELETE" },
    ).catch(() => {});
    delete positions[app.id];
    localStorage.setItem(
      `space-app-positions:${deviceId}`,
      JSON.stringify(positions),
    );
    el?.remove();
    menu.classList.remove("show");
  }
  menu.addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    if (action === "delete" && menuApp) removeApp(menuApp.app, menuApp.el);
    else if (action === "open") menu.classList.remove("show");
  });
  document.addEventListener("pointerdown", (event) => {
    if (!menu.contains(event.target)) menu.classList.remove("show");
  });

  function makeDraggable(el, app) {
    let drag = null;
    el.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const rect = el.getBoundingClientRect();
      drag = {
        id: event.pointerId,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      el.setPointerCapture(event.pointerId);
      el.classList.add("dragging");
    });
    el.addEventListener("pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      el.style.left = `${Math.max(4, Math.min(innerWidth - el.offsetWidth - 4, event.clientX - drag.x))}px`;
      el.style.top = `${Math.max(4, Math.min(innerHeight - 52 - el.offsetHeight, event.clientY - drag.y))}px`;
    });
    el.addEventListener("pointerup", () => {
      if (!drag) return;
      drag = null;
      el.classList.remove("dragging");
      const cellW = 88,
        cellH = 92;
      let snappedLeft = Math.max(
        8,
        Math.round((el.offsetLeft - 8) / cellW) * cellW + 8,
      );
      let snappedTop = Math.max(
        8,
        Math.round((el.offsetTop - 8) / cellH) * cellH + 8,
      );
      const occupied = [
        ...document.querySelectorAll(
          ".space-custom-app,.dskApp.space-native-ready",
        ),
      ]
        .filter(
          (node) => node !== el && getComputedStyle(node).display !== "none",
        )
        .map((node) => ({ x: node.offsetLeft, y: node.offsetTop }));
      while (
        occupied.some(
          (point) =>
            Math.abs(point.x - snappedLeft) < 44 &&
            Math.abs(point.y - snappedTop) < 46,
        )
      ) {
        snappedTop += cellH;
        if (snappedTop > innerHeight - 145) {
          snappedTop = 8;
          snappedLeft += cellW;
        }
      }
      snappedLeft = Math.min(snappedLeft, innerWidth - 84);
      el.style.left = `${snappedLeft}px`;
      el.style.top = `${snappedTop}px`;
      positions[app.id] = { left: snappedLeft, top: snappedTop };
      localStorage.setItem(
        `space-app-positions:${deviceId}`,
        JSON.stringify(positions),
      );
      const bin = [...document.querySelectorAll(".dskApp")].find(
        (node) => node.textContent?.trim() === "Recycle Bin",
      );
      if (bin) {
        const a = el.getBoundingClientRect();
        const b = bin.getBoundingClientRect();
        if (
          a.left < b.right &&
          a.right > b.left &&
          a.top < b.bottom &&
          a.bottom > b.top
        )
          removeApp(app, el);
      }
    });
  }

  function syncName(name) {
    if (!name) return;
    const old = currentName;
    currentName = name;
    document.title = `Win11 — ${name}`;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    while (walker.nextNode()) {
      const text = walker.currentNode.nodeValue?.trim();
      if (text === "Liber-V" || text === old)
        walker.currentNode.nodeValue = walker.currentNode.nodeValue.replace(
          text,
          name,
        );
    }
  }

  function isVisible(element) {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 280 || rect.height <= 180) return false;
    let node = element;
    while (
      node &&
      node !== document.body &&
      !node.classList?.contains("desktop")
    ) {
      const style = getComputedStyle(node);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number(style.opacity) < 0.15
      )
        return false;
      node = node.parentElement;
    }
    return true;
  }

  function syncDesktopChrome(type) {
    const candidates = [
      ...document.querySelectorAll(
        ".settingsApp,.windowScreen,.restWindow,.cmdcont,.noteText",
      ),
    ];
    const activeRoots = new Set();
    candidates
      .filter(isVisible)
      .forEach((node) => activeRoots.add(node.closest(".floatTab") || node));
    document.querySelectorAll(".space-native-window-open").forEach((node) => {
      if (!activeRoots.has(node))
        node.classList.remove("space-native-window-open");
    });
    activeRoots.forEach((node) =>
      node.classList.add("space-native-window-open"),
    );
    if (activeRoots.size) menu.classList.remove("show");

    const isPc = type === "pc" || type === "server";
    const battery = [
      ...document.querySelectorAll(
        'svg[data-icon*="battery"],img[src*="battery"],*[class*="battery"]',
      ),
    ].filter((node) => node.getBoundingClientRect().top > innerHeight - 80);
    battery.forEach((node) => {
      const target = node.closest("div") || node;
      target.dataset.spaceBattery = "true";
      target.style.display = isPc ? "none" : "";
    });
    if (!isPc)
      document
        .querySelectorAll('[data-space-battery="true"]')
        .forEach((node) => (node.style.display = ""));
  }

  function wallpaper(url) {
    if (!url) return;
    const full =
      url.startsWith("http") || url.startsWith("/")
        ? url
        : `/win11/img/wallpaper/${url}`;
    const elements = [...document.querySelectorAll("div")].filter((element) => {
      const image = getComputedStyle(element).backgroundImage;
      return (
        image &&
        image !== "none" &&
        (image.includes("wallpaper") || image.includes("background_2"))
      );
    });
    (
      elements.sort(
        (a, b) =>
          b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight,
      )[0] || document.body
    ).style.backgroundImage = `url("${full}")`;
  }

  function apps(list) {
    const signature = JSON.stringify(list || []);
    if (signature === appsSignature) return;
    appsSignature = signature;
    layer.innerHTML = "";
    (list || []).forEach((app, index) => {
      const el = document.createElement("div");
      el.className = "space-custom-app";
      el.dataset.appId = app.id;
      const saved = positions[app.id];
      el.style.left = `${saved?.left ?? 120 + Math.floor(index / 7) * 88}px`;
      el.style.top = `${saved?.top ?? 155 + (index % 7) * 94}px`;
      const img = document.createElement("img");
      img.src =
        app.icon?.startsWith("/") || app.icon?.startsWith("http")
          ? app.icon
          : `/win11/img/icon/${app.icon || "explorer"}.png`;
      const label = document.createElement("span");
      label.textContent = app.name;
      el.append(img, label);
      el.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
        menuApp = { app, el };
        menu.style.left = `${Math.min(event.clientX, innerWidth - 230)}px`;
        menu.style.top = `${Math.min(event.clientY, innerHeight - 355)}px`;
        menu.classList.add("show");
      });
      makeDraggable(el, app);
      layer.appendChild(el);
    });
  }

  document.addEventListener(
    "click",
    (event) => {
      if (
        event.target.closest("*")?.textContent?.trim() === "Show desktop icons"
      )
        setTimeout(() => layer.classList.toggle("hidden"), 40);
    },
    true,
  );

  function dragWindow(win, bar) {
    let drag;
    bar.onpointerdown = (event) => {
      if (event.target.closest("button")) return;
      const rect = win.getBoundingClientRect();
      drag = [event.clientX - rect.left, event.clientY - rect.top];
      bar.setPointerCapture(event.pointerId);
    };
    bar.onpointermove = (event) => {
      if (!drag) return;
      win.style.left = `${Math.max(0, Math.min(innerWidth - win.offsetWidth, event.clientX - drag[0]))}px`;
      win.style.top = `${Math.max(0, Math.min(innerHeight - 52 - win.offsetHeight, event.clientY - drag[1]))}px`;
      win.style.transform = "none";
    };
    bar.onpointerup = () => (drag = null);
  }

  function closeVideo(notify = false) {
    document.querySelector("#space-video-window")?.remove();
    document.querySelector("#space-video-task")?.remove();
    document.querySelector("#space-video-lock")?.remove();
    if (notify)
      fetch(`/api/devices/${encodeURIComponent(deviceId)}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "remove" }),
      }).catch(() => {});
  }
  function closeMedia() {
    document.querySelector("#space-photos-window")?.remove();
    closeVideo(false);
  }

  function openVideo(command) {
    if (viewMode !== "live") return;
    closeVideo(false);
    const win = document.createElement("section");
    win.id = "space-video-window";
    if (command.displayMode === "fullscreen")
      win.classList.add("is-fullscreen");
    win.innerHTML = `<header><span><img src="${command.icon || "/win11/img/icon/xbox.png"}" alt="">${command.name || "Game"}</span><button aria-label="Close">×</button></header><main><video src="${command.url}" autoplay loop playsinline></video></main>`;
    document.body.appendChild(win);
    const task = document.createElement("button");
    task.id = "space-video-task";
    task.innerHTML = `<img src="${command.icon || "/win11/img/icon/xbox.png"}" alt="">`;
    task.title = command.name || "Game";
    document.body.appendChild(task);
    const video = win.querySelector("video");
    video.addEventListener("loadedmetadata", () => {
      if (video.duration && command.startedAt)
        video.currentTime =
          ((Date.now() - command.startedAt) / 1000) % video.duration;
      video.play().catch(() => {});
    });
    win.querySelector("button").onclick = () => closeVideo(true);
    task.onclick = () => {
      win.classList.toggle("is-minimized");
      task.classList.toggle(
        "is-active",
        !win.classList.contains("is-minimized"),
      );
    };
    task.classList.add("is-active");
    dragWindow(win, win.querySelector("header"));
  }

  function openFuckVideo(command) {
    closeMedia();
    const overlay = document.createElement("div");
    overlay.id = "space-video-lock";
    overlay.innerHTML = `<video src="${command.url}" autoplay loop playsinline></video>`;
    document.body.appendChild(overlay);
    const video = overlay.querySelector("video");
    video.addEventListener("loadedmetadata", () => {
      if (video.duration && command.startedAt)
        video.currentTime =
          ((Date.now() - command.startedAt) / 1000) % video.duration;
      video.play().catch(() => {});
    });
  }

  function media(command) {
    if (!command || command.id === lastMedia) return;
    lastMedia = command.id;
    if (command.type === "remove") return closeMedia();
    if (command.type === "kill") {
      closeMedia();
      window.close();
      return;
    }
    if (command.type === "video") return openFuckVideo(command);
    if (command.type === "video_app") return openVideo(command);
    if (command.type === "image") {
      document.querySelector("#space-photos-window")?.remove();
      const win = document.createElement("section");
      win.id = "space-photos-window";
      win.innerHTML = `<header><span>Photos — ${command.name || "Image"}</span><button>×</button></header><main><img src="${command.url}" alt=""></main>`;
      document.body.appendChild(win);
      win.querySelector("button").onclick = () => win.remove();
      dragWindow(win, win.querySelector("header"));
    }
  }

  const nativePositions = JSON.parse(
    localStorage.getItem(`space-native-positions:${deviceId}`) || "{}",
  );
  const hiddenNative = new Set(
    JSON.parse(localStorage.getItem(`space-native-hidden:${deviceId}`) || "[]"),
  );
  function desktopName(el) {
    return (el.textContent || el.getAttribute("aria-label") || "App")
      .trim()
      .replace(/\s+/g, " ");
  }
  function snapNative(el, left, top) {
    const cellW = 88,
      cellH = 92;
    let x = Math.max(8, Math.round((left - 8) / cellW) * cellW + 8);
    let y = Math.max(8, Math.round((top - 8) / cellH) * cellH + 8);
    const occupied = [
      ...document.querySelectorAll(
        ".dskApp.space-native-ready,.space-custom-app",
      ),
    ]
      .filter((n) => n !== el && getComputedStyle(n).display !== "none")
      .map((n) => ({ x: n.offsetLeft, y: n.offsetTop }));
    while (
      occupied.some((p) => Math.abs(p.x - x) < 44 && Math.abs(p.y - y) < 46)
    ) {
      y += cellH;
      if (y > innerHeight - 145) {
        y = 8;
        x += cellW;
      }
    }
    return {
      left: Math.min(x, innerWidth - 84),
      top: Math.min(y, innerHeight - 140),
    };
  }
  function enableNativeDesktopApps() {
    [...document.querySelectorAll(".dskApp")].forEach((el) => {
      if (el.classList.contains("space-native-ready")) return;
      const name = desktopName(el);
      if (!name) return;
      el.classList.add("space-native-ready");
      el.dataset.spaceNativeName = name;
      if (hiddenNative.has(name)) {
        el.style.display = "none";
        return;
      }
      const rect = el.getBoundingClientRect();
      const saved = nativePositions[name];
      el.style.position = "fixed";
      el.style.left = `${saved?.left ?? rect.left}px`;
      el.style.top = `${saved?.top ?? rect.top}px`;
      el.style.margin = "0";
      let drag = null;
      el.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        const r = el.getBoundingClientRect();
        drag = {
          id: event.pointerId,
          x: event.clientX - r.left,
          y: event.clientY - r.top,
          sx: event.clientX,
          sy: event.clientY,
          moved: false,
        };
        el.setPointerCapture(event.pointerId);
      });
      el.addEventListener("pointermove", (event) => {
        if (!drag || drag.id !== event.pointerId) return;
        if (Math.hypot(event.clientX - drag.sx, event.clientY - drag.sy) > 4)
          drag.moved = true;
        if (!drag.moved) return;
        event.preventDefault();
        el.classList.add("space-native-dragging");
        el.style.left = `${Math.max(4, Math.min(innerWidth - el.offsetWidth - 4, event.clientX - drag.x))}px`;
        el.style.top = `${Math.max(4, Math.min(innerHeight - 54 - el.offsetHeight, event.clientY - drag.y))}px`;
      });
      el.addEventListener(
        "pointerup",
        (event) => {
          if (!drag) return;
          const moved = drag.moved;
          drag = null;
          el.classList.remove("space-native-dragging");
          if (moved) {
            event.preventDefault();
            event.stopPropagation();
            const pos = snapNative(el, el.offsetLeft, el.offsetTop);
            el.style.left = `${pos.left}px`;
            el.style.top = `${pos.top}px`;
            nativePositions[name] = pos;
            localStorage.setItem(
              `space-native-positions:${deviceId}`,
              JSON.stringify(nativePositions),
            );
          }
        },
        true,
      );
    });
  }
  function enhanceAbout() {
    const about = document.querySelector(".aboutApp");
    const content = about?.querySelector(".content");
    if (!content || content.dataset.spaceEnhanced) return;
    content.dataset.spaceEnhanced = "true";
    content.innerHTML = `<div class="space-security-about"><div class="space-security-icon">⚠</div><div><h2>Windows Security Notice</h2><p><b>Unusual activity was detected in this virtual session.</b></p><p>Windows isolated the environment to protect the host device. Review recently opened applications and continue only if you recognize this activity.</p><dl><div><dt>Device</dt><dd>${currentName}</dd></div><div><dt>Protection</dt><dd>Active</dd></div><div><dt>Environment</dt><dd>Isolated VM</dd></div></dl><small>Microsoft Windows Security • Session monitoring is active</small></div></div>`;
  }
  let clock = document.querySelector("#space-live-clock");
  if (!clock) {
    clock = document.createElement("div");
    clock.id = "space-live-clock";
    document.body.appendChild(clock);
  }
  function updateClock() {
    const now = new Date();
    clock.innerHTML = `<b>${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b><span>${now.toLocaleDateString([], { month: "2-digit", day: "2-digit", year: "numeric" })}</span>`;
  }
  updateClock();
  setInterval(updateClock, 1000);
  const desktopObserver = new MutationObserver(() => {
    enableNativeDesktopApps();
    enhanceAbout();
  });
  desktopObserver.observe(document.body, { childList: true, subtree: true });
  setInterval(() => {
    enableNativeDesktopApps();
    enhanceAbout();
  }, 1200);

  async function poll() {
    try {
      const response = await fetch(
        `/api/devices/${encodeURIComponent(deviceId)}/config`,
        { cache: "no-store" },
      );
      if (!response.ok) return;
      const device = (await response.json()).device;
      if (viewMode === "live" && device.liveEnabled === false) {
        document.body.innerHTML =
          '<div id="space-live-error"><b>Error Live streaming now</b><span>Live has been disabled for this device by the administrator.</span></div>';
        return;
      }
      if (device.status === "Offline") {
        if (document.querySelector("#space-video-window")) window.close();
        return;
      }
      syncName(device.name);
      wallpaper(device.wallpaper);
      apps(device.customApps);
      syncDesktopChrome(device.type);
      media(device.mediaCommand);
    } catch {}
  }
  poll();
  setInterval(poll, 900);
})();
