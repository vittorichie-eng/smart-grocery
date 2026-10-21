/**
 * Database & State Storage Management for Smart Grocery
 */

const STORAGE_KEYS = {
  CONFIG: 'config',
  TROLLEY: 'trolley',
  HISTORY: 'history',
  CATALOG: 'catalog'
};

class StorageManager {
  constructor() {
    this.init();
  }

  getCurrentUserId() {
    const user = window.auth ? window.auth.getCurrentUser() : null;
    return user ? user.id : 'user-default';
  }

  getStorageKey(keyType) {
    const uid = this.getCurrentUserId();
    return `smart_grocery_${uid}_${keyType.toLowerCase()}`;
  }

  initForUser(userId) {
    const configKey = `smart_grocery_${userId}_config`;
    const trolleyKey = `smart_grocery_${userId}_trolley`;
    const historyKey = `smart_grocery_${userId}_history`;
    const catalogKey = `smart_grocery_${userId}_catalog`;

    // Load or initialize user config
    if (!localStorage.getItem(configKey)) {
      const user = window.auth ? window.auth.getCurrentUser() : null;
      const initialConfig = {
        ...window.DEFAULT_CONFIG,
        monthlyBudget: user?.monthlyBudget || window.DEFAULT_CONFIG.monthlyBudget,
        currentStore: user?.store || window.DEFAULT_CONFIG.currentStore
      };
      localStorage.setItem(configKey, JSON.stringify(initialConfig));
    }

    // Load or initialize user trolley
    if (!localStorage.getItem(trolleyKey)) {
      if (userId === 'user-siti-02') {
        const sitiItems = [
          {
            id: 'item-siti-1',
            name: 'Susu UHT Diamond 1L',
            category: 'Minuman & Nutrisi',
            price: 19500,
            quantity: 2,
            unit: 'L',
            priority: 'Wajib',
            inCart: true,
            discountType: 'none',
            discountVal: 0,
            note: 'Stok sarapan'
          },
          {
            id: 'item-siti-2',
            name: 'Roti Gandum Sari Roti',
            category: 'Makanan Quick',
            price: 21000,
            quantity: 1,
            unit: 'pack',
            priority: 'Wajib',
            inCart: true,
            discountType: 'none',
            discountVal: 0,
            note: 'Sarapan sehat'
          },
          {
            id: 'item-siti-3',
            name: 'Kopi Kenangan Ready to Drink',
            category: 'Cemilan (Keinginan)',
            price: 11000,
            quantity: 3,
            unit: 'botol',
            priority: 'Keinginan',
            inCart: false,
            discountType: 'buy_x_get_y',
            buyX: 2,
            getY: 1,
            discountVal: 0,
            note: 'Promo beli 2 gratis 1'
          }
        ];
        localStorage.setItem(trolleyKey, JSON.stringify(sitiItems));
      } else if (userId === 'user-budi-01') {
        const legacyCart = localStorage.getItem('smart_grocery_trolley');
        const items = legacyCart ? JSON.parse(legacyCart) : window.DEFAULT_TROLLEY_ITEMS;
        localStorage.setItem(trolleyKey, JSON.stringify(items));
      } else {
        localStorage.setItem(trolleyKey, JSON.stringify([]));
      }
    }

    if (!localStorage.getItem(historyKey)) {
      localStorage.setItem(historyKey, JSON.stringify(window.DEFAULT_HISTORY || []));
    }
    if (!localStorage.getItem(catalogKey)) {
      localStorage.setItem(catalogKey, JSON.stringify(window.PAST_CATALOG || []));
    }
  }

  init() {
    this.initForUser(this.getCurrentUserId());
  }

  triggerCloudSync() {
    if (window.firebaseSync && typeof window.firebaseSync.queueSync === 'function') {
      window.firebaseSync.queueSync();
    }
  }

  // --- CONFIG METHODS ---
  getConfig() {
    this.initForUser(this.getCurrentUserId());
    try {
      return JSON.parse(localStorage.getItem(this.getStorageKey('config'))) || window.DEFAULT_CONFIG;
    } catch (e) {
      return window.DEFAULT_CONFIG;
    }
  }

  saveConfig(newConfig) {
    const current = this.getConfig();
    const updated = { ...current, ...newConfig };
    localStorage.setItem(this.getStorageKey('config'), JSON.stringify(updated));
    this.triggerCloudSync();
    return updated;
  }

  // --- TROLLEY METHODS ---
  getTrolley() {
    this.initForUser(this.getCurrentUserId());
    try {
      return JSON.parse(localStorage.getItem(this.getStorageKey('trolley'))) || [];
    } catch (e) {
      return [];
    }
  }

  saveTrolley(items) {
    localStorage.setItem(this.getStorageKey('trolley'), JSON.stringify(items));
    this.triggerCloudSync();
  }

  addItem(item) {
    const items = this.getTrolley();
    const newItem = {
      id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      inCart: false,
      priority: item.priority || 'Wajib',
      discountType: item.discountType || 'none',
      discountVal: parseFloat(item.discountVal) || 0,
      tierDiscountVal: parseFloat(item.tierDiscountVal) || 0,
      buyX: parseInt(item.buyX) || 0,
      getY: parseInt(item.getY) || 0,
      ...item
    };
    items.unshift(newItem);
    this.saveTrolley(items);
    return newItem;
  }

  updateItem(id, updatedFields) {
    const items = this.getTrolley();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updatedFields };
      this.saveTrolley(items);
    }
    return items;
  }

  deleteItem(id) {
    const items = this.getTrolley().filter(i => i.id !== id);
    this.saveTrolley(items);
    return items;
  }

  clearTrolley() {
    this.saveTrolley([]);
  }

  // --- CALCULATIONS ---
  calculateItemFinalPrice(item) {
    const baseUnitPrice = parseFloat(item.price) || 0;
    const qty = parseFloat(item.quantity) || 1;
    let finalUnitPrice = baseUnitPrice;

    // Apply Discount Types
    if (item.discountType === 'percent') {
      const disc = Math.min(100, Math.max(0, item.discountVal || 0));
      finalUnitPrice = baseUnitPrice * (1 - disc / 100);
    } else if (item.discountType === 'tiered') {
      // e.g. 50% + 20%
      const d1 = Math.min(100, Math.max(0, item.discountVal || 0));
      const d2 = Math.min(100, Math.max(0, item.tierDiscountVal || 0));
      const step1 = baseUnitPrice * (1 - d1 / 100);
      finalUnitPrice = step1 * (1 - d2 / 100);
    } else if (item.discountType === 'nominal') {
      // Direct price reduction per item or total
      const discountNominal = parseFloat(item.discountVal) || 0;
      finalUnitPrice = Math.max(0, baseUnitPrice - discountNominal);
    } else if (item.discountType === 'buy_x_get_y' && item.buyX > 0 && item.getY > 0) {
      // Buy X Get Y Free logic (e.g., Buy 2 get 1 free)
      const groupSize = item.buyX + item.getY;
      const totalUnits = Math.floor(qty);
      const paidUnits = Math.floor(totalUnits / groupSize) * item.buyX + (totalUnits % groupSize);
      const subtotal = paidUnits * baseUnitPrice + (qty - totalUnits) * baseUnitPrice;
      return subtotal;
    }

    return Math.round(finalUnitPrice * qty);
  }

  getTrolleySummary() {
    const items = this.getTrolley();
    const config = this.getConfig();

    let grossTotal = 0;
    let totalSavings = 0;
    let wajibTotal = 0;
    let keinginanTotal = 0;
    let itemCount = 0;
    let cartItemCount = 0;

    items.forEach(item => {
      const baseTotal = (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 1);
      const finalTotal = this.calculateItemFinalPrice(item);
      const savings = Math.max(0, baseTotal - finalTotal);

      grossTotal += finalTotal;
      totalSavings += savings;
      itemCount++;
      if (item.inCart) cartItemCount++;

      if (item.priority === 'Keinginan') {
        keinginanTotal += finalTotal;
      } else {
        wajibTotal += finalTotal;
      }
    });

    // Tax calculation
    const ppnAmount = Math.round((grossTotal * (config.ppnRate || 0)) / 100);
    const bagFee = config.bagFee || 0;
    const grandTotal = grossTotal + ppnAmount + (items.length > 0 ? bagFee : 0);

    const budgetLimit = config.monthlyBudget || 750000;
    const remainingBudget = budgetLimit - grandTotal;
    const isOverBudget = remainingBudget < 0;
    const budgetPercentage = Math.min(100, Math.round((grandTotal / budgetLimit) * 100));

    // Status Level
    let budgetStatus = 'safe'; // safe, warning, danger
    if (budgetPercentage >= 100 || isOverBudget) {
      budgetStatus = 'danger';
    } else if (budgetPercentage >= 80) {
      budgetStatus = 'warning';
    }

    return {
      grossTotal,
      grandTotal,
      totalSavings,
      wajibTotal,
      keinginanTotal,
      ppnAmount,
      bagFee,
      itemCount,
      cartItemCount,
      budgetLimit,
      remainingBudget,
      isOverBudget,
      budgetPercentage,
      budgetStatus
    };
  }

  // --- PRICE COMPARISON METHOD ---
  comparePriceWithPastCatalog(itemName, currentUnitPrice, unitName) {
    const catalog = this.getCatalog();
    if (!itemName) return null;

    const matched = catalog.find(
      c => c.name.toLowerCase().trim() === itemName.toLowerCase().trim()
    );

    if (!matched || !matched.lastPrice) return null;

    const diff = currentUnitPrice - matched.lastPrice;
    const percentage = Math.round((diff / matched.lastPrice) * 100 * 10) / 10;
    
    return {
      lastPrice: matched.lastPrice,
      diff,
      percentage,
      isMoreExpensive: diff > 0,
      isCheaper: diff < 0,
      isSame: diff === 0
    };
  }

  // --- CATALOG & HISTORY METHODS ---
  getCatalog() {
    this.initForUser(this.getCurrentUserId());
    try {
      return JSON.parse(localStorage.getItem(this.getStorageKey('catalog'))) || [];
    } catch (e) {
      return [];
    }
  }

  getHistory() {
    this.initForUser(this.getCurrentUserId());
    try {
      return JSON.parse(localStorage.getItem(this.getStorageKey('history'))) || [];
    } catch (e) {
      return [];
    }
  }

  saveSessionToHistory(sessionData) {
    const history = this.getHistory();
    history.unshift({
      id: 'hist-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      displayDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      ...sessionData
    });
    localStorage.setItem(this.getStorageKey('history'), JSON.stringify(history));

    // Also update catalog with new item prices!
    const catalog = this.getCatalog();
    sessionData.items.forEach(item => {
      const idx = catalog.findIndex(c => c.name.toLowerCase() === item.name.toLowerCase());
      if (idx !== -1) {
        catalog[idx].lastPrice = item.price;
      } else {
        catalog.push({
          name: item.name,
          category: item.category || 'Lain-lain',
          lastPrice: item.price,
          unit: item.unit || '1 pcs'
        });
      }
    });
    localStorage.setItem(this.getStorageKey('catalog'), JSON.stringify(catalog));
    this.triggerCloudSync();
  }

  resetAllData() {
    localStorage.setItem(this.getStorageKey('config'), JSON.stringify(window.DEFAULT_CONFIG));
    localStorage.setItem(this.getStorageKey('trolley'), JSON.stringify(window.DEFAULT_TROLLEY_ITEMS));
    localStorage.setItem(this.getStorageKey('history'), JSON.stringify(window.DEFAULT_HISTORY));
    localStorage.setItem(this.getStorageKey('catalog'), JSON.stringify(window.PAST_CATALOG));
    this.triggerCloudSync();
  }
}

window.db = new StorageManager();
