/**
 * Sample Initial Data for Smart Grocery PWA
 * Tailored for Indonesian Supermarkets & Daily Needs
 */

window.DEFAULT_CONFIG = {
  monthlyBudget: 750000,
  currentStore: 'Hari-Hari Pasar Swalayan',
  ppnRate: 0, // 0% or 11% optional
  bagFee: 500, // Rp 500 paper/plastic bag
  currency: 'Rp'
};

// Available Store Locations
window.STORE_LOCATIONS = [
  { id: 'hari-hari', name: 'Hari-Hari Pasar Swalayan', address: 'Cabang Fatmawati / ITC', type: 'Supermarket Hemat' },
  { id: 'hypermart', name: 'Hypermart', address: 'Mall Mega Megastore', type: 'Hypermarket Promo' },
  { id: 'superindo', name: 'Super Indo', address: 'Cabang Depok - Margonda', type: 'Supermarket Segar' },
  { id: 'grandlucky', name: 'Grand Lucky', address: 'Kawasan SCBD Sudirman', type: 'Premium Grocery' },
  { id: 'lotte-mart', name: 'Lotte Mart', address: 'Grosir & Retail Kuningan', type: 'Grosir & Retail' },
  { id: 'indomaret', name: 'Indomaret Fresh', address: 'Minimarket Dekat Kos', type: 'Minimarket' }
];

// Rich Product Catalog with baseline prices for comparison and quick-select
window.PAST_CATALOG = [
  // --- BAHAN POKOK ---
  { name: 'Beras Ramos 5kg', category: 'Bahan Pokok', lastPrice: 72000, unit: '5 kg' },
  { name: 'Beras Pandan Wangi 5kg', category: 'Bahan Pokok', lastPrice: 86000, unit: '5 kg' },
  { name: 'Minyak Goreng Sania 2L', category: 'Bahan Pokok', lastPrice: 34500, unit: '2 L' },
  { name: 'Minyak Goreng Bimoli 2L', category: 'Bahan Pokok', lastPrice: 36000, unit: '2 L' },
  { name: 'Minyak Goreng Tropical 2L', category: 'Bahan Pokok', lastPrice: 35000, unit: '2 L' },
  { name: 'Telur Ayam Negeri 1kg', category: 'Bahan Pokok', lastPrice: 28000, unit: '1 kg' },
  { name: 'Gula Pasir Gulaku 1kg', category: 'Bahan Pokok', lastPrice: 17500, unit: '1 kg' },
  { name: 'Tepung Terigu Segitiga Biru 1kg', category: 'Bahan Pokok', lastPrice: 13500, unit: '1 kg' },
  { name: 'Air Mineral Aqua Galon 19L Refill', category: 'Bahan Pokok', lastPrice: 20000, unit: '1 galon' },
  { name: 'Air Mineral Le Minerale 1.5L', category: 'Bahan Pokok', lastPrice: 6500, unit: '1 botol' },

  // --- MAKANAN & MIE INSTAN ---
  { name: 'Indomie Goreng Spesial (Pack 5)', category: 'Makanan Cepat Saji', lastPrice: 15500, unit: '5 pcs' },
  { name: 'Indomie Ayam Bawang (Pack 5)', category: 'Makanan Cepat Saji', lastPrice: 15000, unit: '5 pcs' },
  { name: 'Mie Sedaap Goreng (Pack 5)', category: 'Makanan Cepat Saji', lastPrice: 15000, unit: '5 pcs' },
  { name: 'Samyang Spicy Hot Chicken Ramen', category: 'Makanan Cepat Saji', lastPrice: 22000, unit: '1 pcs' },
  { name: 'Roti Tawar Sari Roti Kupas', category: 'Makanan Olahan', lastPrice: 15500, unit: '1 pack' },
  { name: 'Roti Gandum Sari Roti', category: 'Makanan Olahan', lastPrice: 21000, unit: '1 pack' },
  { name: 'Sosis Kimbo Reddi Sapi Siap Makan', category: 'Makanan Olahan', lastPrice: 18000, unit: '1 toples' },
  { name: 'Sosis Kanzler Singles Original', category: 'Makanan Olahan', lastPrice: 8500, unit: '1 pcs' },
  { name: 'Kanzler Crispy Chicken Nugget 450g', category: 'Makanan Olahan', lastPrice: 46000, unit: '450 gram' },
  { name: 'Fiesta Chicken Nugget 500g', category: 'Makanan Olahan', lastPrice: 43000, unit: '500 gram' },
  { name: 'Kornet Sapi Pronas 198g', category: 'Makanan Olahan', lastPrice: 23500, unit: '1 kaleng' },
  { name: 'Sarden ABC Tomat 425g', category: 'Makanan Olahan', lastPrice: 24000, unit: '1 kaleng' },

  // --- LAUK, DAGING & SEGAR ---
  { name: 'Daging Ayam Fillet Dada 500g', category: 'Lauk & Segar', lastPrice: 26000, unit: '500 gram' },
  { name: 'Daging Sapi Rendang 500g', category: 'Lauk & Segar', lastPrice: 68000, unit: '500 gram' },
  { name: 'Tempe Papan Segar', category: 'Lauk & Segar', lastPrice: 6000, unit: '1 pcs' },
  { name: 'Tahu Putih Sutra Box', category: 'Lauk & Segar', lastPrice: 8000, unit: '1 box' },

  // --- BUMBU & BAHAN MASAK ---
  { name: 'Kecap Manis Bango Refill 520ml', category: 'Bumbu & Bahan', lastPrice: 24000, unit: '520 ml' },
  { name: 'Kecap Manis ABC 520ml', category: 'Bumbu & Bahan', lastPrice: 20500, unit: '520 ml' },
  { name: 'Saus Sambal ABC Extra Pedas 335ml', category: 'Bumbu & Bahan', lastPrice: 14500, unit: '1 botol' },
  { name: 'Royco Kaldu Sapi 230g', category: 'Bumbu & Bahan', lastPrice: 11000, unit: '230 gram' },
  { name: 'Masako Rasa Ayam 250g', category: 'Bumbu & Bahan', lastPrice: 10500, unit: '250 gram' },
  { name: 'Margarin Blue Band 200g', category: 'Bumbu & Bahan', lastPrice: 10000, unit: '200 gram' },
  { name: 'Bawang Merah Kupas 250g', category: 'Bumbu & Bahan', lastPrice: 16000, unit: '250 gram' },
  { name: 'Bawang Putih Kupas 250g', category: 'Bumbu & Bahan', lastPrice: 15000, unit: '250 gram' },

  // --- MINUMAN & NUTRISI ---
  { name: 'Susu UHT Ultra Milk Full Cream 1L', category: 'Minuman', lastPrice: 19500, unit: '1 L' },
  { name: 'Susu UHT Ultra Milk Cokelat 1L', category: 'Minuman', lastPrice: 19500, unit: '1 L' },
  { name: 'Susu UHT Greenfields Full Cream 1L', category: 'Minuman', lastPrice: 24000, unit: '1 L' },
  { name: 'Susu Beruang Bear Brand 189ml', category: 'Minuman', lastPrice: 10500, unit: '1 kaleng' },
  { name: 'Kopi Kapal Api Special Mix (10s)', category: 'Minuman', lastPrice: 13500, unit: '10 saset' },
  { name: 'Kopi Nescafe Classic Jar 100g', category: 'Minuman', lastPrice: 38000, unit: '100 gram' },
  { name: 'Kopi Good Day Mocacinno (10s)', category: 'Minuman', lastPrice: 14000, unit: '10 saset' },
  { name: 'Teh Celup Sariwangi Kotak (25s)', category: 'Minuman', lastPrice: 7500, unit: '1 box' },
  { name: 'Teh Botol Sosro Kotak 1L', category: 'Minuman', lastPrice: 10500, unit: '1 L' },
  { name: 'Yakult Minuman Fermentasi (Pack 5)', category: 'Minuman', lastPrice: 10500, unit: '5 botol' },
  { name: 'Pocari Sweat Botol 500ml', category: 'Minuman', lastPrice: 8000, unit: '1 botol' },
  { name: 'Buavita Orange Juice 1L', category: 'Minuman', lastPrice: 26000, unit: '1 L' },

  // --- CUCI & DETERJEN & KEBERSIHAN ---
  { name: 'Deterjen Rinso Molto Bubuk 770g', category: 'Cuci & Kebersihan', lastPrice: 25000, unit: '770 gram' },
  { name: 'Deterjen Rinso Cair Matic Refill 750ml', category: 'Cuci & Kebersihan', lastPrice: 24500, unit: '750 ml' },
  { name: 'Deterjen Attack Plus Softener 800g', category: 'Cuci & Kebersihan', lastPrice: 27500, unit: '800 gram' },
  { name: 'Deterjen Daia Putih 850g', category: 'Cuci & Kebersihan', lastPrice: 18500, unit: '850 gram' },
  { name: 'Deterjen So Klin Liquid Cair 720ml', category: 'Cuci & Kebersihan', lastPrice: 19000, unit: '720 ml' },
  { name: 'Pewangi Downy Mystique Refill 650ml', category: 'Cuci & Kebersihan', lastPrice: 28000, unit: '650 ml' },
  { name: 'Pewangi Molto All-in-One 720ml', category: 'Cuci & Kebersihan', lastPrice: 24000, unit: '720 ml' },
  { name: 'Sabun Cuci Piring Sunlight Jeruk Nipis 650ml', category: 'Cuci & Kebersihan', lastPrice: 14500, unit: '650 ml' },
  { name: 'Sabun Cuci Piring Mama Lemon 680ml', category: 'Cuci & Kebersihan', lastPrice: 12500, unit: '680 ml' },
  { name: 'Pembersih Lantai Super O2 / So Klin 780ml', category: 'Cuci & Kebersihan', lastPrice: 12000, unit: '780 ml' },
  { name: 'Wipol Karbol Wangi Cemara 750ml', category: 'Cuci & Kebersihan', lastPrice: 18000, unit: '750 ml' },
  { name: 'Pembersih Toilet Harpic Power Plus 450ml', category: 'Cuci & Kebersihan', lastPrice: 24000, unit: '450 ml' },
  { name: 'Spons Cuci Piring Scotch-Brite (Pack 3)', category: 'Cuci & Kebersihan', lastPrice: 15000, unit: '1 pack' },
  { name: 'Kamper Kamar Mandi Bagus Anti Bau', category: 'Cuci & Kebersihan', lastPrice: 16500, unit: '1 pack' },

  // --- MANDI & PERAWATAN DIRI ---
  { name: 'Sabun Mandi Lifebuoy Refill 450ml', category: 'Mandi & Perawatan', lastPrice: 22500, unit: '450 ml' },
  { name: 'Sabun Mandi Dettol Original Refill 410g', category: 'Mandi & Perawatan', lastPrice: 27000, unit: '410 gram' },
  { name: 'Sabun Mandi Biore Men Cool 450ml', category: 'Mandi & Perawatan', lastPrice: 26000, unit: '450 ml' },
  { name: 'Shampoo Sunsilk Black Shine 160ml', category: 'Mandi & Perawatan', lastPrice: 21000, unit: '160 ml' },
  { name: 'Shampoo Head & Shoulders Cool Menthol 300ml', category: 'Mandi & Perawatan', lastPrice: 42000, unit: '300 ml' },
  { name: 'Shampoo Clear Men Anti Dandruff 160ml', category: 'Mandi & Perawatan', lastPrice: 26500, unit: '160 ml' },
  { name: 'Pasta Gigi Pepsodent 190g', category: 'Mandi & Perawatan', lastPrice: 13500, unit: '190 gram' },
  { name: 'Pasta Gigi Sensodyne Fresh Mint 100g', category: 'Mandi & Perawatan', lastPrice: 31000, unit: '100 gram' },
  { name: 'Sikat Gigi Formula Double Action (Pack 3)', category: 'Mandi & Perawatan', lastPrice: 14000, unit: '1 pack' },
  { name: 'Tisu Wajah Paseo 250 Sheets', category: 'Mandi & Perawatan', lastPrice: 16500, unit: '1 pack' },
  { name: 'Tisu Basah Mitu Antiseptic 50s', category: 'Mandi & Perawatan', lastPrice: 12000, unit: '1 pack' },

  // --- CEMILAN & SNACK (KEINGINAN) ---
  { name: 'Cemilan Chitato Sapi Panggang 68g', category: 'Cemilan & Snack', lastPrice: 11500, unit: '68 gram' },
  { name: 'Cemilan Lays / Lay-Stax Potato 100g', category: 'Cemilan & Snack', lastPrice: 18000, unit: '100 gram' },
  { name: 'Biskuit Oreo Vanilla Roll 119g', category: 'Cemilan & Snack', lastPrice: 10000, unit: '1 pack' },
  { name: 'Cokelat SilverQueen Chunky Bar 95g', category: 'Cemilan & Snack', lastPrice: 25000, unit: '1 pcs' }
];

// Default items preloaded in live shopping trolley for demonstration
window.DEFAULT_TROLLEY_ITEMS = [
  {
    id: 'item-1',
    name: 'Beras Ramos 5kg',
    category: 'Bahan Pokok',
    price: 74500,
    quantity: 1,
    unit: '5 kg',
    priority: 'Wajib',
    inCart: true,
    discountType: 'none',
    discountVal: 0,
    note: 'Kebutuhan pokok utama'
  },
  {
    id: 'item-2',
    name: 'Minyak Goreng Sania 2L',
    category: 'Bahan Pokok',
    price: 33900,
    quantity: 1,
    unit: '2 L',
    priority: 'Wajib',
    inCart: true,
    discountType: 'percent',
    discountVal: 5,
    note: 'Promo hemat'
  },
  {
    id: 'item-3',
    name: 'Deterjen Rinso Molto Bubuk 770g',
    category: 'Cuci & Kebersihan',
    price: 25000,
    quantity: 1,
    unit: '770 gram',
    priority: 'Wajib',
    inCart: false,
    discountType: 'nominal',
    discountVal: 2000,
    note: 'Untuk cuci pakaian'
  },
  {
    id: 'item-4',
    name: 'Susu UHT Ultra Milk Full Cream 1L',
    category: 'Minuman',
    price: 19500,
    quantity: 2,
    unit: '1 L',
    priority: 'Wajib',
    inCart: false,
    discountType: 'none',
    discountVal: 0,
    note: 'Nutrisi sarapan'
  },
  {
    id: 'item-5',
    name: 'Cemilan Chitato Sapi Panggang 68g',
    category: 'Cemilan & Snack',
    price: 11500,
    quantity: 2,
    unit: '68 gram',
    priority: 'Keinginan',
    inCart: false,
    discountType: 'none',
    discountVal: 0,
    note: 'Cemilan saat santai'
  }
];

// Past shopping history sessions
window.DEFAULT_HISTORY = [
  {
    id: 'hist-1',
    date: '2026-09-15',
    displayDate: '15 September 2026',
    storeName: 'Hari-Hari Pasar Swalayan',
    totalSpent: 428500,
    budgetLimit: 750000,
    itemCount: 12,
    status: 'Aman (Under Budget)',
    items: [
      { name: 'Beras Ramos 5kg', qty: 1, price: 72000, priority: 'Wajib', category: 'Bahan Pokok' },
      { name: 'Minyak Goreng Sania 2L', qty: 1, price: 34500, priority: 'Wajib', category: 'Bahan Pokok' },
      { name: 'Deterjen Rinso Molto Bubuk 770g', qty: 1, price: 25000, priority: 'Wajib', category: 'Cuci & Kebersihan' },
      { name: 'Sabun Cuci Piring Sunlight 650ml', qty: 1, price: 14500, priority: 'Wajib', category: 'Cuci & Kebersihan' },
      { name: 'Susu UHT Ultra Milk Full Cream 1L', qty: 2, price: 19500, priority: 'Wajib', category: 'Minuman' },
      { name: 'Indomie Goreng Spesial (Pack 5)', qty: 2, price: 15500, priority: 'Wajib', category: 'Makanan Cepat Saji' },
      { name: 'Sabun Mandi Lifebuoy Refill 450ml', qty: 2, price: 22500, priority: 'Wajib', category: 'Mandi & Perawatan' },
      { name: 'Cemilan Chitato Sapi Panggang 68g', qty: 2, price: 11500, priority: 'Keinginan', category: 'Cemilan & Snack' }
    ]
  },
  {
    id: 'hist-2',
    date: '2026-08-10',
    displayDate: '10 Agustus 2026',
    storeName: 'Hypermart',
    totalSpent: 385000,
    budgetLimit: 700000,
    itemCount: 9,
    status: 'Aman (Under Budget)',
    items: [
      { name: 'Beras Pandan Wangi 5kg', qty: 1, price: 86000, priority: 'Wajib', category: 'Bahan Pokok' },
      { name: 'Minyak Goreng Bimoli 2L', qty: 1, price: 36000, priority: 'Wajib', category: 'Bahan Pokok' },
      { name: 'Deterjen Attack Plus Softener 800g', qty: 1, price: 27500, priority: 'Wajib', category: 'Cuci & Kebersihan' },
      { name: 'Kopi Kapal Api Special Mix (10s)', qty: 2, price: 13500, priority: 'Wajib', category: 'Minuman' },
      { name: 'Pewangi Downy Mystique Refill 650ml', qty: 1, price: 28000, priority: 'Wajib', category: 'Cuci & Kebersihan' }
    ]
  }
];
