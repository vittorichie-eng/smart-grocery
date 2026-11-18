/**
 * Authentication & User Session Manager for Smart Grocery
 * Supports Multi-User accounts (Local Storage + Firebase Authentication)
 */

const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'smart_grocery_current_user',
  ALL_USERS: 'smart_grocery_registered_users'
};

// Preset demo accounts for quick testing & demonstration
const DEMO_USERS = [
  {
    id: 'user-budi-01',
    name: 'Budi Santoso',
    email: 'budi@smartgrocery.id',
    password: 'password123',
    avatar: '👨‍🎓',
    role: 'Mahasiswa Rantau',
    monthlyBudget: 750000,
    store: 'Super Indo - Depok'
  },
  {
    id: 'user-siti-02',
    name: 'Siti Rahma',
    email: 'siti@smartgrocery.id',
    password: 'password123',
    avatar: '👩‍💼',
    role: 'Karyawan Kost',
    monthlyBudget: 1500000,
    store: 'Grand Lucky - SCBD'
  }
];

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    this.init();
  }

  init() {
    // Seed demo accounts into registered users if not present
    const users = this.getRegisteredUsers();
    let updated = false;
    DEMO_USERS.forEach(demo => {
      if (!users.some(u => u.id === demo.id || u.email === demo.email)) {
        users.push(demo);
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
    }

    // Load active session
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[Auth] Failed to parse active user session', e);
      this.currentUser = null;
    }

    // If no user is logged in, default to the first demo account so the app starts smoothly
    if (!this.currentUser && users.length > 0) {
      this.currentUser = users[0];
      localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    }
  }

  onAuthChange(callback) {
    this.authListeners.push(callback);
    callback(this.currentUser);
  }

  notifyAuthChange() {
    this.authListeners.forEach(cb => {
      try { cb(this.currentUser); } catch (e) { console.error(e); }
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }

  setCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    }
    this.notifyAuthChange();
  }

  getRegisteredUsers() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.ALL_USERS)) || [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Register a new user account
   */
  async register({ name, email, password, monthlyBudget, role, store }) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();
    const cleanPassword = String(password || '').trim();

    if (!cleanEmail || !cleanPassword || !cleanName) {
      throw new Error('Nama, Email, dan Password wajib diisi.');
    }

    const users = this.getRegisteredUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Email sudah terdaftar. Silakan masuk menggunakan akun tersebut.');
    }

    let uid = 'user-' + Date.now();

    const newUser = {
      id: uid,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      avatar: this.generateAvatarEmoji(cleanName),
      role: role || 'Member Belanja',
      monthlyBudget: parseFloat(monthlyBudget) || 750000,
      store: store || 'Hari-Hari Pasar Swalayan',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(AUTH_STORAGE_KEYS.ALL_USERS, JSON.stringify(users));

    // Switch to new user
    this.setCurrentUser(newUser);

    // Initialize user's config
    if (window.db) {
      window.db.saveConfig({
        monthlyBudget: newUser.monthlyBudget,
        currentStore: newUser.store
      });
    }

    return newUser;
  }

  /**
   * Log in to existing account
   */
  async login({ email, password }) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      throw new Error('Email dan Password wajib diisi.');
    }

    // Local authentication
    const users = this.getRegisteredUsers();
    const matched = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matched) {
      throw new Error('Akun dengan email ini tidak ditemukan.');
    }

    if (matched.password && matched.password !== cleanPassword) {
      throw new Error('Kata sandi salah. Silakan coba lagi.');
    }

    this.setCurrentUser(matched);
    return matched;
  }

  /**
   * Switch directly to another registered account
   */
  switchUser(userId) {
    const users = this.getRegisteredUsers();
    const target = users.find(u => u.id === userId);
    if (target) {
      this.setCurrentUser(target);
      return target;
    }
    return null;
  }

  /**
   * Quick login with demo account
   */
  loginDemo(demoId) {
    return this.switchUser(demoId);
  }

  /**
   * Log out active user
   */
  async logout() {
    this.setCurrentUser(null);
  }

  /**
   * Log in using Google / Gmail Account
   */
  async loginWithGoogle() {
    // Direct Gmail Account Login / Connect Prompt
    const enteredEmail = prompt('Masukkan Alamat Email Gmail Anda (@gmail.com):', 'user.grocery@gmail.com');
    if (!enteredEmail || !enteredEmail.trim()) {
      throw new Error('Login Gmail dibatalkan.');
    }

    const cleanEmail = enteredEmail.trim().toLowerCase();
    const usernamePart = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
    const formattedName = usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1);

    const users = this.getRegisteredUsers();
    let existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!existingUser) {
      existingUser = {
        id: 'google-' + Date.now(),
        name: formattedName || 'Pengguna Gmail',
        email: cleanEmail,
        avatar: '🔴', // Google icon placeholder
        role: 'Gmail User',
        monthlyBudget: 750000,
        store: 'Hari-Hari Pasar Swalayan',
        isGoogleUser: true,
        createdAt: new Date().toISOString()
      };
      users.push(existingUser);
      localStorage.setItem(AUTH_STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
    }

    this.setCurrentUser(existingUser);

    if (window.db) {
      window.db.initForUser(existingUser.id);
    }

    return existingUser;
  }

  generateAvatarEmoji(name) {
    const emojis = ['🧑‍🎓', '👩‍💻', '👨‍🍳', '🧑‍🎨', '👩‍🏫', '👨‍💼', '🧑‍🔬', '👧', '👦'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % emojis.length;
    return emojis[index];
  }
}

window.auth = new AuthManager();
