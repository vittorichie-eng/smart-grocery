/**
 * Sample Initial Data for Smart Grocery PWA
 * Tailored for Indonesian "Siswa Rantau" (Students living in dorms/boarding houses)
 */

window.DEFAULT_CONFIG = {
  monthlyBudget: 750000,
  currentStore: 'Super Indo - Depok',
  ppnRate: 0, // 0% or 11% optional
  bagFee: 500, // Rp 500 paper/plastic bag
  currency: 'Rp'
};

// Past month catalog with baseline prices for price comparison
window.PAST_CATALOG = [
  { name: 'Beras Ramos 5kg', category: 'Bahan Pokok', lastPrice: 72000, unit: '5 kg' },
  { name: 'Minyak Goreng Sania 2L', category: 'Bahan Pokok', lastPrice: 34500, unit: '2 L' },
  { name: 'Telur Ayam 1kg', category: 'Bahan Pokok', lastPrice: 28000, unit: '1 kg' },
  { name: 'Indomie Goreng (Pack 5)', category: 'Makanan Quick', lastPrice: 15500, unit: '5 pcs' },
  { name: 'Daging Ayam Fillet 500g', category: 'Lauk & Daging', lastPrice: 26000, unit: '500 gram' },
  { name: 'Kecap Manis Bango 520ml', category: 'Bumbu & Bahan', lastPrice: 24000, unit: '520 ml' },
  { name: 'Susu UHT Full Cream 1L', category: 'Minuman & Nutrisi', lastPrice: 18500, unit: '1 L' },
  { name: 'Roti Tawar Kupas', category: 'Makanan Quick', lastPrice: 14000, unit: '1 pack' },
  { name: 'Sabun Mandi Lifebuoy Refill 450ml', category: 'Mandi & Mandi', lastPrice: 22500, unit: '450 ml' },
  { name: 'Shampoo Sunsilk 160ml', category: 'Mandi & Mandi', lastPrice: 21000, unit: '160 ml' },
  { name: 'Pasta Gigi Pepsodent 190g', category: 'Mandi & Mandi', lastPrice: 12500, unit: '190 gram' },
  { name: 'Deterjen Rinso Matik 770g', category: 'Cuci & Kebersihan', lastPrice: 25000, unit: '770 gram' },
  { name: 'Kopi Kapal Api Saset (10s)', category: 'Minuman & Nutrisi', lastPrice: 13500, unit: '10 saset' },
  { name: 'Cemilan Chitato 68g', category: 'Cemilan (Keinginan)', lastPrice: 11500, unit: '68 gram' },
  { name: 'Boba Milk Tea Bottled', category: 'Cemilan (Keinginan)', lastPrice: 15000, unit: '1 botol' },
  { name: 'Air Mineral Galon Aqua Refill', category: 'Bahan Pokok', lastPrice: 20000, unit: '1 galon' }
];

// Default items preloaded in live shopping trolley for demonstration
window.DEFAULT_TROLLEY_ITEMS = [
  {
    id: 'item-1',
    name: 'Beras Ramos 5kg',
    category: 'Bahan Pokok',
    price: 74500, // Price went up slightly compared to last month Rp 72.000
    quantity: 1,
    unit: '5 kg',
    priority: 'Wajib', // Need
    inCart: true,
    discountType: 'none',
    discountVal: 0,
    note: 'Kebutuhan utama nasi sebulan'
  },
  {
    id: 'item-2',
    name: 'Minyak Goreng Sania 2L',
    category: 'Bahan Pokok',
    price: 33900, // Promo! Cheaper than Rp 34.500
    quantity: 1,
    unit: '2 L',
    priority: 'Wajib',
    inCart: true,
    discountType: 'percent',
    discountVal: 5, // 5% discount
    note: 'Diskon promo akhir pekan'
  },
  {
    id: 'item-3',
    name: 'Telur Ayam 1kg',
    category: 'Bahan Pokok',
    price: 29000, // Naik dari Rp 28.000
    quantity: 1.5, // 1.5 kg
    unit: 'kg',
    priority: 'Wajib',
    inCart: true,
    discountType: 'none',
    discountVal: 0,
    note: 'Stok protein anak kos'
  },
  {
    id: 'item-4',
    name: 'Indomie Goreng (Pack 5)',
    category: 'Makanan Quick',
    price: 15500,
    quantity: 2,
    unit: '5 pcs',
    priority: 'Wajib',
    inCart: false, // Belum diambil dari rak
    discountType: 'none',
    discountVal: 0,
    note: 'Penyelamat akhir bulan'
  },
  {
    id: 'item-5',
    name: 'Deterjen Rinso Matik 770g',
    category: 'Cuci & Kebersihan',
    price: 27000,
    quantity: 1,
    unit: '770 gram',
    priority: 'Wajib',
    inCart: false,
    discountType: 'nominal',
    discountVal: 3000, // Potongan Rp 3.000
    note: 'Voucher Super Indo'
  },
  {
    id: 'item-6',
    name: 'Cemilan Chitato 68g',
    category: 'Cemilan (Keinginan)',
    price: 12500,
    quantity: 2,
    unit: '68 gram',
    priority: 'Keinginan', // Want
    inCart: false,
    discountType: 'none',
    discountVal: 0,
    note: 'Cemilan saat nugas'
  }
];

// Past shopping history sessions
window.DEFAULT_HISTORY = [
  {
    id: 'hist-1',
    date: '2026-09-15',
    displayDate: '15 September 2026',
    storeName: 'Super Indo - Margonda',
    totalSpent: 428500,
    budgetLimit: 750000,
    itemCount: 12,
    status: 'Aman (Under Budget)',
    items: [
      { name: 'Beras Ramos 5kg', qty: 1, price: 72000, priority: 'Wajib' },
      { name: 'Minyak Goreng Sania 2L', qty: 1, price: 34500, priority: 'Wajib' },
      { name: 'Telur Ayam 1kg', qty: 2, price: 56000, priority: 'Wajib' },
      { name: 'Indomie Goreng Pack', qty: 3, price: 46500, priority: 'Wajib' },
      { name: 'Sabun Mandi Refill', qty: 2, price: 45000, priority: 'Wajib' },
      { name: 'Shampoo Sunsilk', qty: 1, price: 21000, priority: 'Wajib' },
      { name: 'Deterjen Rinso 770g', qty: 1, price: 25000, priority: 'Wajib' },
      { name: 'Kopi Kapal Api', qty: 2, price: 27000, priority: 'Wajib' },
      { name: 'Susu UHT 1L', qty: 2, price: 37000, priority: 'Wajib' },
      { name: 'Chitato 68g', qty: 3, price: 34500, priority: 'Keinginan' },
      { name: 'Roti Tawar', qty: 2, price: 28000, priority: 'Wajib' }
    ]
  },
  {
    id: 'hist-2',
    date: '2026-08-10',
    displayDate: '10 Agustus 2026',
    storeName: 'Indomaret Point - Akses UI',
    totalSpent: 385000,
    budgetLimit: 700000,
    itemCount: 9,
    status: 'Aman (Under Budget)',
    items: [
      { name: 'Beras 5kg', qty: 1, price: 70000, priority: 'Wajib' },
      { name: 'Telur Ayam 1kg', qty: 2, price: 54000, priority: 'Wajib' },
      { name: 'Minyak Goreng 2L', qty: 1, price: 33500, priority: 'Wajib' },
      { name: 'Kecap Bango 520ml', qty: 1, price: 23500, priority: 'Wajib' },
      { name: 'Susu UHT 1L', qty: 3, price: 54000, priority: 'Wajib' },
      { name: 'Indomie 1 Karton', qty: 1, price: 112000, priority: 'Wajib' },
      { name: 'Snack & Drinks', qty: 2, price: 38000, priority: 'Keinginan' }
    ]
  }
];
