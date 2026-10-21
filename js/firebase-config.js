/**
 * Firebase Cloud Firestore Integration - Single Access User
 * Smart Grocery & Budget Safety Tracker
 * 
 * PANDUAN MENGHUBUNGKAN KE FIREBASE:
 * 1. Buka Firebase Console: https://console.firebase.google.com/
 * 2. Buat proyek Firebase baru (atau gunakan yang sudah ada).
 * 3. Buka menu 'Firestore Database' di sisi kiri, klik 'Create database',
 *    dan pilih 'Start in test mode' (agar bisa baca/tulis langsung).
 * 4. Buka Project Settings (ikon gerigi) -> General -> Tambahkan Web App (ikon </>).
 * 5. Salin nilai firebaseConfig dan ganti nilai placeholder di bawah ini,
 *    ATAU masukkan langsung melalui UI menu "Pengaturan Firebase" di aplikasi!
 */

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBuW1ILJ5j3071Mis79KImtKzgW3nczFaw",
  authDomain: "smart-grocery-5ad5b.firebaseapp.com",
  projectId: "smart-grocery-5ad5b",
  storageBucket: "smart-grocery-5ad5b.firebasestorage.app",
  messagingSenderId: "367020688680",
  appId: "1:367020688680:web:88675cc620d70750d8bc1d"
};

const FIREBASE_STORAGE_KEY = 'smart_grocery_firebase_config';

class FirebaseSyncManager {
  constructor() {
    this.status = 'unconfigured'; // 'unconfigured' | 'connected' | 'syncing' | 'error' | 'offline'
    this.firestore = null;
    this.app = null;
    this.unsubscribeListener = null;
    this.statusListeners = [];
    this.isSyncing = false;
  }

  getConfig() {
    try {
      const stored = localStorage.getItem(FIREBASE_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_FIREBASE_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('[Firebase] Failed to parse stored config', e);
    }
    return DEFAULT_FIREBASE_CONFIG;
  }

  saveConfig(newConfig) {
    localStorage.setItem(FIREBASE_STORAGE_KEY, JSON.stringify(newConfig));
    return this.init();
  }

  clearConfig() {
    localStorage.removeItem(FIREBASE_STORAGE_KEY);
    this.status = 'unconfigured';
    this.firestore = null;
    this.notifyStatusChange();
  }

  isConfigured() {
    const cfg = this.getConfig();
    return Boolean(
      cfg &&
      cfg.apiKey &&
      cfg.apiKey !== 'YOUR_API_KEY' &&
      cfg.projectId &&
      cfg.projectId !== 'YOUR_PROJECT_ID'
    );
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback);
    callback(this.status);
  }

  notifyStatusChange() {
    this.statusListeners.forEach(cb => {
      try { cb(this.status); } catch (e) { console.error(e); }
    });
  }

  async init() {
    if (!window.firebase) {
      console.warn('[Firebase] Firebase SDK not loaded from CDN.');
      this.status = 'error';
      this.notifyStatusChange();
      return false;
    }

    if (!this.isConfigured()) {
      console.info('[Firebase] Firebase config is using default placeholders. Waiting for user credentials.');
      this.status = 'unconfigured';
      this.notifyStatusChange();
      return false;
    }

    try {
      const config = this.getConfig();

      // Initialize or reuse Firebase App
      if (!window.firebase.apps || window.firebase.apps.length === 0) {
        this.app = window.firebase.initializeApp(config);
      } else {
        this.app = window.firebase.app();
      }

      this.firestore = window.firebase.firestore();

      // Enable offline persistence for Firestore if available
      try {
        await this.firestore.enablePersistence({ synchronizeTabs: true });
        console.log('[Firebase] Offline persistence enabled.');
      } catch (err) {
        if (err.code === 'failed-precondition') {
          console.warn('[Firebase] Persistence failed: Multiple tabs open.');
        } else if (err.code === 'unimplemented') {
          console.warn('[Firebase] Browser does not support persistence.');
        }
      }

      this.status = 'connected';
      this.notifyStatusChange();
      console.log('[Firebase] Connected to Firestore successfully!');

      // Set up real-time listener for Single-User Cloud Sync
      this.setupRealtimeListener();

      return true;
    } catch (err) {
      console.error('[Firebase] Initialization error:', err);
      this.status = 'error';
      this.notifyStatusChange();
      return false;
    }
  }

  getDocRef() {
    if (!this.firestore) return null;
    const user = window.auth ? window.auth.getCurrentUser() : null;
    const userId = user ? user.id : 'user-default';
    // Multi-User Firestore Storage: each user has their own private document
    return this.firestore.collection('users').doc(userId);
  }

  /**
   * Listen to remote cloud changes and sync to local state in real-time
   */
  setupRealtimeListener() {
    const docRef = this.getDocRef();
    if (!docRef) return;

    if (this.unsubscribeListener) {
      this.unsubscribeListener();
    }

    this.unsubscribeListener = docRef.onSnapshot(
      { includeMetadataChanges: true },
      (snapshot) => {
        if (snapshot.exists) {
          // If this snapshot has pending local writes from this device, skip to avoid double rendering
          if (snapshot.metadata && snapshot.metadata.hasPendingWrites) {
            return;
          }
          const data = snapshot.data();
          if (data) {
            this.applyCloudDataToLocal(data);
          }
        } else {
          // Document doesn't exist yet on Cloud Firestore, push initial local data
          console.log('[Firebase] Remote doc empty, uploading initial local state for user...');
          this.pushCurrentLocalToCloud();
        }
      },
      (error) => {
        console.warn('[Firebase] Realtime snapshot listener error:', error);
        if (!navigator.onLine) {
          this.status = 'offline';
        } else {
          this.status = 'error';
        }
        this.notifyStatusChange();
      }
    );
  }

  /**
   * Apply cloud data into local storage and trigger instant UI re-render
   */
  applyCloudDataToLocal(cloudData) {
    if (!cloudData || !window.db) return;
    let hasChanges = false;

    const currentTrolley = localStorage.getItem(window.db.getStorageKey('trolley'));
    const newTrolleyStr = JSON.stringify(cloudData.trolley || []);
    if (cloudData.trolley && currentTrolley !== newTrolleyStr) {
      localStorage.setItem(window.db.getStorageKey('trolley'), newTrolleyStr);
      hasChanges = true;
    }

    const currentConfig = localStorage.getItem(window.db.getStorageKey('config'));
    const newConfigStr = JSON.stringify(cloudData.config || {});
    if (cloudData.config && currentConfig !== newConfigStr) {
      localStorage.setItem(window.db.getStorageKey('config'), newConfigStr);
      hasChanges = true;
    }

    const currentHistory = localStorage.getItem(window.db.getStorageKey('history'));
    const newHistoryStr = JSON.stringify(cloudData.history || []);
    if (cloudData.history && currentHistory !== newHistoryStr) {
      localStorage.setItem(window.db.getStorageKey('history'), newHistoryStr);
      hasChanges = true;
    }

    const currentCatalog = localStorage.getItem(window.db.getStorageKey('catalog'));
    const newCatalogStr = JSON.stringify(cloudData.catalog || []);
    if (cloudData.catalog && currentCatalog !== newCatalogStr) {
      localStorage.setItem(window.db.getStorageKey('catalog'), newCatalogStr);
      hasChanges = true;
    }

    if (hasChanges) {
      window.dispatchEvent(new CustomEvent('smart_grocery_data_updated', {
        detail: { source: 'cloud' }
      }));
    }
  }

  /**
   * Push current full local data to Cloud Firestore for the active user
   */
  async pushCurrentLocalToCloud() {
    if (!this.isConfigured() || !this.firestore) return false;

    try {
      this.isSyncing = true;
      this.status = 'syncing';
      this.notifyStatusChange();

      const user = window.auth ? window.auth.getCurrentUser() : null;
      const docRef = this.getDocRef();
      const payload = {
        userId: user ? user.id : 'default',
        userName: user ? user.name : 'Pengguna',
        userEmail: user ? user.email : '',
        config: window.db ? window.db.getConfig() : {},
        trolley: window.db ? window.db.getTrolley() : [],
        history: window.db ? window.db.getHistory() : [],
        catalog: window.db ? window.db.getCatalog() : [],
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      };

      await docRef.set(payload, { merge: true });

      this.status = 'connected';
      this.notifyStatusChange();
      console.log('[Firebase] Real-time sync pushed to Firestore!');
      return true;
    } catch (err) {
      console.error('[Firebase] Failed to push local data to Firestore:', err);
      this.status = navigator.onLine ? 'error' : 'offline';
      this.notifyStatusChange();
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Instant trigger or ultra-fast debounce to sync changes to cloud
   */
  queueSync(immediate = true) {
    if (!this.isConfigured() || !this.firestore) return;
    if (this._debounceTimer) clearTimeout(this._debounceTimer);

    if (immediate) {
      this.pushCurrentLocalToCloud();
      return;
    }

    this._debounceTimer = setTimeout(() => {
      this.pushCurrentLocalToCloud();
    }, 80);
  }
}

window.firebaseSync = new FirebaseSyncManager();
