const DEFAULT_BLOCKED = [
  "k","j","l","i","o",",",".","/","c","m","f","t","n","p",
  "0","1","2","3","4","5","6","7","8","9",
  "Numpad0","Numpad1","Numpad2","Numpad3","Numpad4",
  "Numpad5","Numpad6","Numpad7","Numpad8","Numpad9",
  " "
];

const ALL_KEYS = [
  " ", "k","j","l","r","i","o",",",".","/","c","m","f","t","n","p",
  "0","1","2","3","4","5","6","7","8","9",
  "Numpad0","Numpad1","Numpad2","Numpad3","Numpad4",
  "Numpad5","Numpad6","Numpad7","Numpad8","Numpad9",
  "ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"
];

const enabledEl = document.getElementById("enabled");
const blockWhenEl = document.getElementById("blockWhen");
const saveEl = document.getElementById("save");
const resetEl = document.getElementById("reset");
const keyGrid = document.getElementById("keyGrid");

function renderCheckboxes(blockedSet) {
  keyGrid.innerHTML = "";
  ALL_KEYS.forEach(key => {
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = key;
    cb.checked = blockedSet.has(key);
    label.appendChild(cb);
    label.appendChild(document.createTextNode(key === " " ? "Space" : key));
    keyGrid.appendChild(label);
  });
}

function getSelectedKeys() {
  return Array.from(keyGrid.querySelectorAll("input:checked")).map(cb => cb.value);
}

function load() {
  chrome.storage.sync.get(
    { enabled: true, blockedKeys: DEFAULT_BLOCKED, blockWhen: "always" },
    (items) => {
      enabledEl.checked = items.enabled;
      blockWhenEl.value = items.blockWhen || "always";
      renderCheckboxes(new Set(items.blockedKeys));
    }
  );
}

function save() {
  const payload = {
    enabled: enabledEl.checked,
    blockedKeys: getSelectedKeys(),
    blockWhen: blockWhenEl.value
  };
  chrome.storage.sync.set(payload);
}

enabledEl.addEventListener("change", save);
blockWhenEl.addEventListener("change", save);
saveEl.addEventListener("click", save);
resetEl.addEventListener("click", () => {
  renderCheckboxes(new Set(DEFAULT_BLOCKED));
  save();
});

load();
