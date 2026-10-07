/**
 * PWA Installer & Offline Handler
 */

let deferredPrompt;

window.addEventListener('load', () => {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[PWA] Service Worker registered:', reg.scope))
      .catch(err => console.error('[PWA] Service Worker registration failed:', err));
  }

  // Handle network status
  function updateOnlineStatus() {
    const offlineBanner = document.getElementById('offlineBanner');
    if (offlineBanner) {
      if (navigator.onLine) {
        offlineBanner.classList.add('hidden');
      } else {
        offlineBanner.classList.remove('hidden');
      }
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
});

// Capture install prompt for PWA Add to Home Screen button
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const pwaInstallBtn = document.getElementById('pwaInstallBtn');
  if (pwaInstallBtn) {
    pwaInstallBtn.style.display = 'flex';
    pwaInstallBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] User response to install prompt: ${outcome}`);
        deferredPrompt = null;
        pwaInstallBtn.style.display = 'none';
      }
    });
  }
});
