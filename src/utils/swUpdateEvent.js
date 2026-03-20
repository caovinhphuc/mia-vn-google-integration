/** Event name + dispatcher dùng chung: index.js (SW register) + PWAUpdatePrompt */
export const SW_UPDATE_EVENT = "mia-sw-update";

export function dispatchSWUpdate(registration) {
  window.dispatchEvent(new CustomEvent(SW_UPDATE_EVENT, { detail: { registration } }));
}
