/**
 * Main Application Logic for Smart Grocery & Budget Safety Tracker
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize App State
  initApp();
});

function initApp() {
  // Refresh Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Bind Navigation
  setupNavigation();

  // Bind Modals & Actions
  setupModalEvents();

  // Render Current Active View
  renderActiveView('trolley');

  // Populate Autocomplete Data
  setupItemNameAutocomplete();

  // Check for PWA install button status
  setupPWAEvents();
}

/* -------------------------------------------------------------------------- */
/* NAVIGATION TAB SYSTEM                                                      */
/* -------------------------------------------------------------------------- */
let currentTab = 'trolley';

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabTarget = btn.getAttribute('data-tab');
      if (tabTarget) {
        navItems.forEach(n => n.classList.remove('active'));
        btn.classList.add('active');
        renderActiveView(tabTarget);
      }
    });
  });
}

function renderActiveView(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab-page').forEach(page => {
    page.classList.remove('active');
  });

  const activePage = document.getElementById(`tab-${tabName}`);
  if (activePage) {
    activePage.classList.add('active');
  }

  // Update Top Header Summary & Safety Bar
  updateHeaderBudgetGauge();

  // Render tab specific logic
  if (tabName === 'trolley') {
    renderTrolleyView();
  } else if (tabName === 'comparator') {
    renderComparatorView();
  } else if (tabName === 'history') {
    renderHistoryView();
  } else if (tabName === 'budget') {
    renderAnalyticsView();
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* -------------------------------------------------------------------------- */
/* HEADER & BUDGET SAFETY CAP GAUGE                                           */
/* -------------------------------------------------------------------------- */
function updateHeaderBudgetGauge() {
  const summary = window.db.getTrolleySummary();
  const config = window.db.getConfig();

  // Store name badge
  const storeBadge = document.getElementById('storeBadgeText');
  if (storeBadge) storeBadge.textContent = config.currentStore || 'Super Indo';

  // Budget progress bar
  const progressFill = document.getElementById('budgetProgressFill');
  const budgetStatusText = document.getElementById('budgetStatusText');
  const budgetRemainingText = document.getElementById('budgetRemainingText');
  const budgetPercentageText = document.getElementById('budgetPercentageText');

  if (progressFill) {
    progressFill.style.width = `${summary.budgetPercentage}%`;
    progressFill.className = `progress-fill ${summary.budgetStatus}`;
  }

  if (budgetPercentageText) {
    budgetPercentageText.textContent = `${summary.budgetPercentage}%`;
  }

  if (budgetRemainingText) {
    if (summary.isOverBudget) {
      const overAmount = Math.abs(summary.remainingBudget);
      budgetRemainingText.textContent = `Over Rp ${formatNumber(overAmount)}`;
      budgetRemainingText.style.color = '#f87171';
    } else {
      budgetRemainingText.textContent = `Sisa Rp ${formatNumber(summary.remainingBudget)}`;
      budgetRemainingText.style.color = '#34d399';
    }
  }

  if (budgetStatusText) {
    budgetStatusText.className = `safety-status-pill ${summary.budgetStatus}`;
    if (summary.budgetStatus === 'safe') {
      budgetStatusText.innerHTML = `🟢 Anggaran Aman`;
    } else if (summary.budgetStatus === 'warning') {
      budgetStatusText.innerHTML = `🟡 Waspada Limit`;
    } else {
      budgetStatusText.innerHTML = `🔴 BAHAYA OVERBUDGET`;
    }
  }

  // Display Trim Keinginan Banner if overbudget
  const trimBanner = document.getElementById('autoTrimBanner');
  if (trimBanner) {
    if (summary.isOverBudget && summary.keinginanTotal > 0) {
      trimBanner.classList.remove('hidden');
      const trimInfo = document.getElementById('trimInfoText');
      if (trimInfo) {
        trimInfo.textContent = `Belanja over Rp ${formatNumber(Math.abs(summary.remainingBudget))}! Hapus ${formatNumber(summary.keinginanTotal)} barang opsional?`;
      }
    } else {
      trimBanner.classList.add('hidden');
    }
  }
}

/* -------------------------------------------------------------------------- */
/* TROLLEY VIEW (LIVE CART)                                                   */
/* -------------------------------------------------------------------------- */
let activeFilter = 'all'; // 'all', 'wajib', 'keinginan', 'incart'

function renderTrolleyView() {
  const items = window.db.getTrolley();
  const listContainer = document.getElementById('trolleyItemList');
  const emptyState = document.getElementById('emptyTrolleyState');

  if (!listContainer) return;

  // Apply Category Filter
  let filteredItems = items;
  if (activeFilter === 'wajib') {
    filteredItems = items.filter(i => i.priority === 'Wajib');
  } else if (activeFilter === 'keinginan') {
    filteredItems = items.filter(i => i.priority === 'Keinginan');
  } else if (activeFilter === 'incart') {
    filteredItems = items.filter(i => i.inCart);
  }

  if (filteredItems.length === 0) {
    listContainer.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
  } else {
    if (emptyState) emptyState.classList.add('hidden');

    listContainer.innerHTML = filteredItems.map(item => {
      const finalPrice = window.db.calculateItemFinalPrice(item);
      const baseUnitPrice = parseFloat(item.price) || 0;
      const comparison = window.db.comparePriceWithPastCatalog(item.name, baseUnitPrice, item.unit);

      // Discount tag
      let discBadge = '';
      if (item.discountType === 'percent') {
        discBadge = `<span class="badge-tag price-down">Diskon ${item.discountVal}%</span>`;
      } else if (item.discountType === 'tiered') {
        discBadge = `<span class="badge-tag price-down">Diskon ${item.discountVal}%+${item.tierDiscountVal}%</span>`;
      } else if (item.discountType === 'nominal') {
        discBadge = `<span class="badge-tag price-down">Hemat Rp ${formatNumber(item.discountVal)}</span>`;
      } else if (item.discountType === 'buy_x_get_y') {
        discBadge = `<span class="badge-tag price-down">Beli ${item.buyX} Gratis ${item.getY}</span>`;
      }

      // Price comparison badge vs last month
      let compBadge = '';
      if (comparison) {
        if (comparison.isMoreExpensive) {
          compBadge = `<span class="badge-tag price-up" title="Bulan lalu Rp ${formatNumber(comparison.lastPrice)}">⬆ ${comparison.percentage}% mahal</span>`;
        } else if (comparison.isCheaper) {
          compBadge = `<span class="badge-tag price-down" title="Bulan lalu Rp ${formatNumber(comparison.lastPrice)}">⬇ ${Math.abs(comparison.percentage)}% murah</span>`;
        } else {
          compBadge = `<span class="badge-tag price-alert">Sama bln lalu</span>`;
        }
      }

      const priorityBadge = item.priority === 'Keinginan'
        ? `<span class="badge-tag keinginan">Keinginan</span>`
        : `<span class="badge-tag wajib">Wajib</span>`;

      return `
        <div class="item-card ${item.inCart ? 'in-cart' : ''}" data-id="${item.id}">
          <div class="item-card-header">
            <div class="checkbox-touch" onclick="toggleCartStatus('${item.id}')">
              ${item.inCart ? '<i data-lucide="check" style="width:16px;height:16px;"></i>' : ''}
            </div>
            <div class="item-details">
              <div class="item-title-row">
                <span class="item-name">${escapeHtml(item.name)}</span>
                <span class="item-category-tag">${escapeHtml(item.category || 'Umum')}</span>
              </div>
              <div class="item-meta-badges">
                ${priorityBadge}
                ${discBadge}
                ${compBadge}
              </div>
            </div>
            <button class="icon-btn-ghost" style="width:28px;height:28px;border:none;" onclick="openEditItemModal('${item.id}')">
              <i data-lucide="more-vertical" style="width:16px;height:16px;"></i>
            </button>
          </div>

          <div class="item-card-bottom">
            <div class="qty-control-pad">
              <button class="qty-btn" onclick="updateItemQuantity('${item.id}', -0.5)">-</button>
              <span class="qty-value">${item.quantity} ${item.unit || 'pcs'}</span>
              <button class="qty-btn" onclick="updateItemQuantity('${item.id}', 0.5)">+</button>
            </div>

            <div class="item-price-display">
              <div class="item-final-price">Rp ${formatNumber(finalPrice)}</div>
              ${discBadge ? `<div class="item-original-price">Rp ${formatNumber(baseUnitPrice * item.quantity)}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Update Trolley Bottom Total Summary
  updateTrolleySummaryBar();
  if (window.lucide) window.lucide.createIcons();
}

function updateTrolleySummaryBar() {
  const summary = window.db.getTrolleySummary();
  const summaryGross = document.getElementById('summaryGrossTotal');
  const summaryGrand = document.getElementById('summaryGrandTotal');
  const summaryCount = document.getElementById('summaryItemCount');
  const summarySavings = document.getElementById('summaryTotalSavings');

  if (summaryGross) summaryGross.textContent = `Rp ${formatNumber(summary.grossTotal)}`;
  if (summaryGrand) summaryGrand.textContent = `Rp ${formatNumber(summary.grandTotal)}`;
  if (summaryCount) summaryCount.textContent = `${summary.cartItemCount} / ${summary.itemCount} item`;
  if (summarySavings) {
    if (summary.totalSavings > 0) {
      summarySavings.textContent = `(Hemat Rp ${formatNumber(summary.totalSavings)})`;
    } else {
      summarySavings.textContent = '';
    }
  }
}

/* Trolley Actions */
function toggleCartStatus(itemId) {
  const items = window.db.getTrolley();
  const item = items.find(i => i.id === itemId);
  if (item) {
    window.db.updateItem(itemId, { inCart: !item.inCart });
    renderTrolleyView();
    updateHeaderBudgetGauge();
  }
}

function updateItemQuantity(itemId, delta) {
  const items = window.db.getTrolley();
  const item = items.find(i => i.id === itemId);
  if (item) {
    let newQty = Math.max(0.1, (parseFloat(item.quantity) || 1) + delta);
    newQty = Math.round(newQty * 10) / 10;
    window.db.updateItem(itemId, { quantity: newQty });
    renderTrolleyView();
    updateHeaderBudgetGauge();
  }
}

/* Fast Trim Non-Essential / Keinginan Items */
function autoTrimKeinginanItems() {
  const items = window.db.getTrolley();
  const updated = items.filter(i => i.priority !== 'Keinginan');
  window.db.saveTrolley(updated);

  renderTrolleyView();
  updateHeaderBudgetGauge();
  showToast('Berhasil memangkas item Keinginan! Belanja kembali aman.');
}

/* -------------------------------------------------------------------------- */
/* ITEM MODAL (ADD & EDIT)                                                    */
/* -------------------------------------------------------------------------- */
let editingItemId = null;

function setupModalEvents() {
  // Add item floating button
  const addItemBtn = document.getElementById('addItemBtn');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => openAddItemModal());
  }

  // Close modal button
  const closeModalBtn = document.getElementById('closeModalBtn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => closeModal());
  }

  // Item form submit
  const itemForm = document.getElementById('itemForm');
  if (itemForm) {
    itemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveItemFromForm();
    });
  }

  // Filter chips in trolley
  document.querySelectorAll('.chip-btn[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip-btn[data-filter]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.getAttribute('data-filter');
      renderTrolleyView();
    });
  });

  // Discount type radio listener
  const discountTypeSelect = document.getElementById('itemDiscountType');
  if (discountTypeSelect) {
    discountTypeSelect.addEventListener('change', () => {
      const type = discountTypeSelect.value;
      document.getElementById('discountValGroup').classList.toggle('hidden', type === 'none');
      document.getElementById('tierDiscountGroup').classList.toggle('hidden', type !== 'tiered');
      document.getElementById('buyXGetYGroup').classList.toggle('hidden', type !== 'buy_x_get_y');
    });
  }

  // Store selector click
  const storeBadge = document.getElementById('storeBadge');
  if (storeBadge) {
    storeBadge.addEventListener('click', () => openStoreSettingModal());
  }

  // Saring Keinginan button
  const trimBtn = document.getElementById('autoTrimBtn');
  if (trimBtn) {
    trimBtn.addEventListener('click', () => autoTrimKeinginanItems());
  }

  // Selesaikan Belanja (Finish Shopping)
  const finishShoppingBtn = document.getElementById('finishShoppingBtn');
  if (finishShoppingBtn) {
    finishShoppingBtn.addEventListener('click', () => finishShoppingSession());
  }
}

function openAddItemModal() {
  editingItemId = null;
  document.getElementById('modalTitle').textContent = 'Tambah Item Belanja';
  document.getElementById('itemForm').reset();
  document.getElementById('itemDiscountType').value = 'none';
  document.getElementById('discountValGroup').classList.add('hidden');
  document.getElementById('tierDiscountGroup').classList.add('hidden');
  document.getElementById('buyXGetYGroup').classList.add('hidden');
  document.getElementById('priceComparisonHint').innerHTML = '';

  const modal = document.getElementById('itemModal');
  modal.classList.add('active');
}

function openEditItemModal(itemId) {
  editingItemId = itemId;
  const items = window.db.getTrolley();
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  document.getElementById('modalTitle').textContent = 'Edit Item Belanja';
  document.getElementById('itemNameInput').value = item.name;
  document.getElementById('itemCategoryInput').value = item.category || 'Bahan Pokok';
  document.getElementById('itemPriceInput').value = item.price;
  document.getElementById('itemQtyInput').value = item.quantity;
  document.getElementById('itemUnitInput').value = item.unit || 'pcs';
  document.getElementById('itemPriorityInput').value = item.priority || 'Wajib';

  const discType = item.discountType || 'none';
  document.getElementById('itemDiscountType').value = discType;
  document.getElementById('itemDiscountVal').value = item.discountVal || '';
  document.getElementById('itemTierDiscountVal').value = item.tierDiscountVal || '';
  document.getElementById('itemBuyX').value = item.buyX || '';
  document.getElementById('itemGetY').value = item.getY || '';

  document.getElementById('discountValGroup').classList.toggle('hidden', discType === 'none');
  document.getElementById('tierDiscountGroup').classList.toggle('hidden', discType !== 'tiered');
  document.getElementById('buyXGetYGroup').classList.toggle('hidden', discType !== 'buy_x_get_y');

  // Trigger price hint comparison
  checkPriceComparisonHint(item.name, item.price, item.unit);

  const modal = document.getElementById('itemModal');
  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('itemModal');
  modal.classList.remove('active');
}

function saveItemFromForm() {
  const name = document.getElementById('itemNameInput').value.trim();
  const category = document.getElementById('itemCategoryInput').value;
  const price = parseFloat(document.getElementById('itemPriceInput').value) || 0;
  const quantity = parseFloat(document.getElementById('itemQtyInput').value) || 1;
  const unit = document.getElementById('itemUnitInput').value || 'pcs';
  const priority = document.getElementById('itemPriorityInput').value || 'Wajib';

  const discountType = document.getElementById('itemDiscountType').value;
  const discountVal = parseFloat(document.getElementById('itemDiscountVal').value) || 0;
  const tierDiscountVal = parseFloat(document.getElementById('itemTierDiscountVal').value) || 0;
  const buyX = parseInt(document.getElementById('itemBuyX').value) || 0;
  const getY = parseInt(document.getElementById('itemGetY').value) || 0;

  if (!name) return;

  const itemData = {
    name,
    category,
    price,
    quantity,
    unit,
    priority,
    discountType,
    discountVal,
    tierDiscountVal,
    buyX,
    getY
  };

  if (editingItemId) {
    window.db.updateItem(editingItemId, itemData);
    showToast('Item berhasil diperbarui');
  } else {
    window.db.addItem(itemData);
    showToast('Item berhasil ditambahkan');
  }

  closeModal();
  renderTrolleyView();
  updateHeaderBudgetGauge();

  // Check if addition triggers overbudget
  const summary = window.db.getTrolleySummary();
  if (summary.isOverBudget) {
    showSafetyCapOverbudgetAlert();
  }
}

/* Autocomplete & Price Compare Listener on Add Item Modal */
function setupItemNameAutocomplete() {
  const nameInput = document.getElementById('itemNameInput');
  const priceInput = document.getElementById('itemPriceInput');
  if (!nameInput) return;

  nameInput.addEventListener('input', () => {
    const val = nameInput.value.trim();
    checkPriceComparisonHint(val, priceInput.value, 'pcs');
  });

  if (priceInput) {
    priceInput.addEventListener('input', () => {
      checkPriceComparisonHint(nameInput.value.trim(), priceInput.value, 'pcs');
    });
  }
}

function checkPriceComparisonHint(name, price, unit) {
  const hintEl = document.getElementById('priceComparisonHint');
  if (!hintEl) return;

  if (!name) {
    hintEl.innerHTML = '';
    return;
  }

  const currentPrice = parseFloat(price) || 0;
  const comp = window.db.comparePriceWithPastCatalog(name, currentPrice, unit);

  if (comp) {
    if (comp.isMoreExpensive) {
      hintEl.innerHTML = `<span style="color:#f87171;">⚠️ <b>Perhatian:</b> Bulan lalu item ini Rp ${formatNumber(comp.lastPrice)} (Sekarang <b>+${comp.percentage}% lebih mahal</b>)</span>`;
    } else if (comp.isCheaper) {
      hintEl.innerHTML = `<span style="color:#34d399;">🎉 <b>Promo!</b> Lebih murah <b>${Math.abs(comp.percentage)}%</b> dari bulan lalu (Rp ${formatNumber(comp.lastPrice)})</span>`;
    } else {
      hintEl.innerHTML = `<span style="color:#94a3b8;">ℹ️ Harga sama dengan acuan bulan lalu (Rp ${formatNumber(comp.lastPrice)})</span>`;
    }
  } else {
    hintEl.innerHTML = `<span style="color:#64748b;">ℹ️ Item baru belum ada di catatan bulan lalu</span>`;
  }
}

/* Overbudget Alert Popup */
function showSafetyCapOverbudgetAlert() {
  const summary = window.db.getTrolleySummary();
  const alertModal = document.getElementById('safetyAlertModal');
  const alertInfo = document.getElementById('safetyAlertInfo');

  if (alertModal && alertInfo) {
    alertInfo.innerHTML = `
      <p style="margin-bottom:8px;">Total belanjaanmu sudah <b>Rp ${formatNumber(summary.grandTotal)}</b>, melampaui batas anggaran (<b>Rp ${formatNumber(summary.budgetLimit)}</b>).</p>
      <p style="color:#fbbf24;">💡 <b>Saran Hemat Anak Rantau:</b><br/>Kamu bisa menekan total belanja hingga <b>Rp ${formatNumber(summary.wajibTotal)}</b> dengan mengeliminasi barang-barang kategori <b>Keinginan</b>.</p>
    `;
    alertModal.classList.add('active');
  }
}

/* -------------------------------------------------------------------------- */
/* STANDALONE UNIT PRICE & DISCOUNT COMPARATOR VIEW                           */
/* -------------------------------------------------------------------------- */
function renderComparatorView() {
  const compContainer = document.getElementById('tab-comparator');
  if (!compContainer) return;

  // Bind live calculator events for side-by-side unit price compare
  const calcBtn = document.getElementById('comparePackagesBtn');
  if (calcBtn) {
    calcBtn.onclick = () => {
      const pA = {
        price: document.getElementById('priceA').value,
        quantity: document.getElementById('qtyA').value
      };
      const pB = {
        price: document.getElementById('priceB').value,
        quantity: document.getElementById('qtyB').value
      };

      const result = window.ComparatorTool.comparePackages(pA, pB);
      const resContainer = document.getElementById('compareResultBox');

      if (!result) {
        resContainer.innerHTML = `<p style="color:#f87171;">Isi semua harga dan ukuran kedua produk untuk melihat perbandingan!</p>`;
        return;
      }

      let resultHtml = `
        <div style="background:rgba(15,23,42,0.8); padding:12px; border-radius:12px; border:1px solid var(--border-color); margin-top:10px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span>Paket A (Per Unit/g/ml):</span> <b>Rp ${formatNumber(result.unitPriceA)}</b>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span>Paket B (Per Unit/g/ml):</span> <b>Rp ${formatNumber(result.unitPriceB)}</b>
          </div>
      `;

      if (result.winner === 'A') {
        resultHtml += `
          <div style="background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.4); padding:10px; border-radius:8px; color:#34d399; font-weight:700;">
            🏆 Paket A LEBIH HEMAT ${result.savingsPercent}% !
          </div>
        `;
      } else if (result.winner === 'B') {
        resultHtml += `
          <div style="background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.4); padding:10px; border-radius:8px; color:#34d399; font-weight:700;">
            🏆 Paket B LEBIH HEMAT ${result.savingsPercent}% !
          </div>
        `;
      } else {
        resultHtml += `
          <div style="background:rgba(59,130,246,0.2); padding:10px; border-radius:8px; color:#60a5fa; font-weight:700;">
            ⚖️ Nilai Kedua Paket SAMA PERSIS!
          </div>
        `;
      }

      resultHtml += `</div>`;
      resContainer.innerHTML = resultHtml;
    };
  }
}

/* -------------------------------------------------------------------------- */
/* HISTORY & RECEIPT VIEW                                                     */
/* -------------------------------------------------------------------------- */
function renderHistoryView() {
  const history = window.db.getHistory();
  const listContainer = document.getElementById('historyListContainer');
  if (!listContainer) return;

  if (history.length === 0) {
    listContainer.innerHTML = `<p style="color:var(--text-sub); text-align:center; padding:20px;">Belum ada riwayat belanja.</p>`;
    return;
  }

  listContainer.innerHTML = history.map(item => `
    <div class="item-card" style="margin-bottom:12px;" onclick="openReceiptModal('${item.id}')">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:700; font-size:0.95rem; color:var(--text-main);">${escapeHtml(item.storeName || 'Super Indo')}</div>
          <div style="font-size:0.75rem; color:var(--text-sub);">${item.displayDate} • ${item.itemCount} Item</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800; color:var(--primary-emerald); font-size:1.05rem;">Rp ${formatNumber(item.totalSpent)}</div>
          <span class="safety-status-pill safe" style="font-size:0.65rem;">Done</span>
        </div>
      </div>
    </div>
  `).join('');
}

function openReceiptModal(historyId) {
  const history = window.db.getHistory();
  const session = history.find(h => h.id === historyId);
  if (!session) return;

  const modal = document.getElementById('receiptModal');
  const paper = document.getElementById('receiptPaperContent');

  if (modal && paper) {
    paper.innerHTML = `
      <div class="receipt-header">
        <h2 style="font-size:1.1rem; margin-bottom:4px;">🛒 ${escapeHtml(session.storeName || 'SUPER INDO')}</h2>
        <div>Tanggal: ${session.displayDate}</div>
        <div>Total Item: ${session.itemCount}</div>
      </div>

      <div style="margin-bottom:12px;">
        ${(session.items || []).map(i => `
          <div class="receipt-item-row">
            <span>${escapeHtml(i.name)} (x${i.qty})</span>
            <span>Rp ${formatNumber(i.price * i.qty)}</span>
          </div>
        `).join('')}
      </div>

      <div class="receipt-total-section">
        <div class="receipt-item-row">
          <span>TOTAL BELANJA</span>
          <span>Rp ${formatNumber(session.totalSpent)}</span>
        </div>
        <div class="receipt-item-row" style="font-size:0.75rem; color:#64748b; font-weight:normal; margin-top:4px;">
          <span>Target Budget</span>
          <span>Rp ${formatNumber(session.budgetLimit || 750000)}</span>
        </div>
      </div>
      <div style="text-align:center; margin-top:14px; font-size:0.7rem; color:#64748b;">
        --- SMART GROCERY DIGITAL RECEIPT ---
      </div>
    `;
    modal.classList.add('active');
  }
}

function finishShoppingSession() {
  const summary = window.db.getTrolleySummary();
  const items = window.db.getTrolley();
  const config = window.db.getConfig();

  if (items.length === 0) {
    showToast('Troli belanjaanmu masih kosong!');
    return;
  }

  const sessionData = {
    storeName: config.currentStore || 'Super Indo',
    totalSpent: summary.grandTotal,
    budgetLimit: summary.budgetLimit,
    itemCount: summary.itemCount,
    items: items.map(i => ({
      name: i.name,
      qty: i.quantity,
      price: i.price,
      unit: i.unit,
      priority: i.priority,
      category: i.category
    }))
  };

  // Save session to history database
  window.db.saveSessionToHistory(sessionData);

  // Trigger celebration confetti animation
  if (window.confetti && !summary.isOverBudget) {
    window.confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  }

  // Clear trolley cart
  window.db.clearTrolley();

  showToast('Belanjaan selesai disimpan ke Riwayat!');
  renderActiveView('history');
}

/* -------------------------------------------------------------------------- */
/* ANALYTICS & BUDGET VIEW                                                    */
/* -------------------------------------------------------------------------- */
let categoryChartInstance = null;

function renderAnalyticsView() {
  const summary = window.db.getTrolleySummary();
  const items = window.db.getTrolley();
  const config = window.db.getConfig();

  // Set budget input display
  const budgetInput = document.getElementById('monthlyBudgetInput');
  if (budgetInput) budgetInput.value = config.monthlyBudget;

  // Calculate spending per category
  const categories = {};
  items.forEach(i => {
    const cat = i.category || 'Lain-lain';
    const total = window.db.calculateItemFinalPrice(i);
    categories[cat] = (categories[cat] || 0) + total;
  });

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  // Chart Rendering
  const ctx = document.getElementById('categoryChart');
  if (ctx && window.Chart) {
    if (categoryChartInstance) categoryChartInstance.destroy();

    categoryChartInstance = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['Belum ada item'],
        datasets: [{
          data: data.length ? data : [1],
          backgroundColor: [
            '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#f8fafc', font: { size: 10 } } }
        }
      }
    });
  }

  // Render Price Inflation Tracker Table
  renderPriceTrackerTable();
}

function renderPriceTrackerTable() {
  const catalog = window.db.getCatalog();
  const tableContainer = document.getElementById('priceTrackerTableContainer');
  if (!tableContainer) return;

  tableContainer.innerHTML = `
    <table style="width:100%; border-collapse:collapse; font-size:0.75rem; text-align:left;">
      <thead>
        <tr style="border-bottom:1px solid var(--border-color); color:var(--text-sub);">
          <th style="padding:6px;">Barang</th>
          <th style="padding:6px;">Kategori</th>
          <th style="padding:6px; text-align:right;">Harga Acuan</th>
        </tr>
      </thead>
      <tbody>
        ${catalog.slice(0, 8).map(c => `
          <tr style="border-bottom:1px dashed rgba(255,255,255,0.05);">
            <td style="padding:8px 6px; font-weight:600;">${escapeHtml(c.name)}</td>
            <td style="padding:8px 6px; color:var(--text-sub);">${escapeHtml(c.category || '-')}</td>
            <td style="padding:8px 6px; text-align:right; font-weight:700; color:var(--primary-emerald);">Rp ${formatNumber(c.lastPrice)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function openStoreSettingModal() {
  const config = window.db.getConfig();
  const newStore = prompt('Masukkan Nama Supermarket / Toko:', config.currentStore || 'Super Indo');
  if (newStore) {
    window.db.saveConfig({ currentStore: newStore });
    updateHeaderBudgetGauge();
  }
}

function saveMonthlyBudgetSetting() {
  const val = parseFloat(document.getElementById('monthlyBudgetInput').value) || 750000;
  window.db.saveConfig({ monthlyBudget: val });
  updateHeaderBudgetGauge();
  showToast('Target Anggaran berhasil diperbarui!');
}

/* -------------------------------------------------------------------------- */
/* UTILITY HELPERS                                                            */
/* -------------------------------------------------------------------------- */
function formatNumber(num) {
  return Math.round(num || 0).toLocaleString('id-ID');
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, match => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[match]);
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid var(--primary-emerald);
    color: #fff;
    padding: 10px 18px;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 700;
    z-index: 200;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    animation: fadeIn 0.2s ease;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function setupPWAEvents() {
  // Configured in pwa.js
}

// Global scope bindings for inline HTML handlers
window.toggleCartStatus = toggleCartStatus;
window.updateItemQuantity = updateItemQuantity;
window.openEditItemModal = openEditItemModal;
window.openReceiptModal = openReceiptModal;
window.saveMonthlyBudgetSetting = saveMonthlyBudgetSetting;
window.closeModal = closeModal;
