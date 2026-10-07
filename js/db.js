/**
 * Database & State Storage Management for Smart Grocery
 */

const STORAGE_KEYS = {
  CONFIG: 'smart_grocery_config',
  TROLLEY: 'smart_grocery_trolley',
  HISTORY: 'smart_grocery_history',
  CATALOG: 'smart_grocery_catalog'
};

class StorageManager {
  constructor() {
    this.init();
  }

  init() {
    // Load config or set default
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(window.DEFAULT_CONFIG));
    }
    // Load trolley or set default
    if (!localStorage.getItem(STORAGE_KEYS.TROLLEY)) {
      localStorage.setItem(STORAGE_KEYS.TROLLEY, JSON.stringify(window.DEFAULT_TROLLEY_ITEMS));
    }
    // Load history or set default
    if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(window.DEFAULT_HISTORY));
    }
    // Load past catalog or set default
    if (!localStorage.getItem(STORAGE_KEYS.CATALOG)) {
      localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(window.PAST_CATALOG));
    }
  }

  // --- CONFIG METHODS ---
  getConfig() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG)) || window.DEFAULT_CONFIG;
    } catch (e) {
      return window.DEFAULT_CONFIG;
    }
  }

  saveConfig(newConfig) {
    const current = this.getConfig();
    const updated = { ...current, ...newConfig };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    return updated;
  }

  // --- TROLLEY METHODS ---
  getTrolley() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TROLLEY)) || [];
    } catch (e) {
      return [];
    }
  }

  saveTrolley(items) {
    localStorage.setItem(STORAGE_KEYS.TROLLEY, JSON.stringify(items));
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
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATALOG)) || [];
    } catch (e) {
      return [];
    }
  }

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
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
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

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
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalog));
  }

  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(window.DEFAULT_CONFIG));
    localStorage.setItem(STORAGE_KEYS.TROLLEY, JSON.stringify(window.DEFAULT_TROLLEY_ITEMS));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(window.DEFAULT_HISTORY));
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(window.PAST_CATALOG));
  }
}

window.db = new StorageManager();
