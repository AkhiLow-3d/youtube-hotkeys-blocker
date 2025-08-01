// content.js - blocks YouTube hotkeys before YouTube handles them.

(function() {
  // Utility: check if target is a text input area (don't block there)
  function isEditable(el) {
    if (!el) return false;
    const tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea") return true;
    if (el.isContentEditable) return true;
    // Some YouTube elements use role="textbox"
    const role = el.getAttribute && el.getAttribute("role");
    if (role === "textbox") return true;
    return false;
  }

  // Default keys commonly used by YouTube
  const DEFAULT_BLOCKED = [
    " ",            // Space (play/pause)
    "k",            // play/pause
    "j", "l",       // seek
    "i", "o",       // step frame (when available)
    ",", ".",       // previous/next frame
    "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
    "Home", "End",
    "/",            // search focus
    "c",            // captions
    "m",            // mute
    "f",            // fullscreen
    "t",            // theater mode
    "n", "p",       // next/previous
    // number row 0-9 (seek to %)
    "0","1","2","3","4","5","6","7","8","9",
    // Numpad digits
    "Numpad0","Numpad1","Numpad2","Numpad3","Numpad4",
    "Numpad5","Numpad6","Numpad7","Numpad8","Numpad9"
  ];

  let enabled = true;
  let blockedKeys = new Set(DEFAULT_BLOCKED);
  let blockWhen = "always"; // "always" | "watchOnly"

  function updateFromStorage(items) {
    if (typeof items.enabled === "boolean") enabled = items.enabled;
    if (Array.isArray(items.blockedKeys)) blockedKeys = new Set(items.blockedKeys);
    if (typeof items.blockWhen === "string") blockWhen = items.blockWhen;
  }

  // Initial load
  chrome.storage.sync.get(
    { enabled: true, blockedKeys: DEFAULT_BLOCKED, blockWhen: "always" },
    updateFromStorage
  );

  // React to changes from popup
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    const fresh = {};
    if (changes.enabled) fresh.enabled = changes.enabled.newValue;
    if (changes.blockedKeys) fresh.blockedKeys = changes.blockedKeys.newValue;
    if (changes.blockWhen) fresh.blockWhen = changes.blockWhen.newValue;
    updateFromStorage(fresh);
  });

  function isWatchPage() {
    return location.pathname === "/watch";
  }

  function handler(e) {
    if (!enabled) return;
    if (isEditable(e.target)) return;

    if (blockWhen === "watchOnly" && !isWatchPage()) return;

    // Normalize key
    const key = e.key;
    if (blockedKeys.has(key)) {
      // Allow an escape hatch: hold Alt to bypass blocking
      if (e.altKey) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
    }
  }

  // Capture at the top, before YouTube's listeners
  window.addEventListener("keydown", handler, { capture: true });
  window.addEventListener("keypress", handler, { capture: true });
  window.addEventListener("keyup", handler, { capture: true });
})();
