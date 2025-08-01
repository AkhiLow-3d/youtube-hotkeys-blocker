(function() {
  function isEditable(el) {
    if (!el) return false;
    const tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea") return true;
    if (el.isContentEditable) return true;
    const role = el.getAttribute && el.getAttribute("role");
    if (role === "textbox") return true;
    return false;
  }

  const DEFAULT_BLOCKED = [
  " ",
  "k",
  "j",
  "l",
  "r",
  "i",
  "o",
  ",",
  ".",
  "/",
  "c",
  "m",
  "f",
  "t",
  "n",
  "p",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "Numpad0",
  "Numpad1",
  "Numpad2",
  "Numpad3",
  "Numpad4",
  "Numpad5",
  "Numpad6",
  "Numpad7",
  "Numpad8",
  "Numpad9",
  "Home",
  "End"
];

  let enabled = true;
  let blockedKeys = new Set(DEFAULT_BLOCKED);
  let blockWhen = "always";

  function updateFromStorage(items) {
    if (typeof items.enabled === "boolean") enabled = items.enabled;
    if (Array.isArray(items.blockedKeys)) blockedKeys = new Set(items.blockedKeys);
    if (typeof items.blockWhen === "string") blockWhen = items.blockWhen;
  }

  chrome.storage.sync.get(
    { enabled: true, blockedKeys: DEFAULT_BLOCKED, blockWhen: "always" },
    updateFromStorage
  );

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

    if (blockedKeys.has(e.key)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  window.addEventListener("keydown", handler, { capture: true });
  window.addEventListener("keypress", handler, { capture: true });
  window.addEventListener("keyup", handler, { capture: true });
})();