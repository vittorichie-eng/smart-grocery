/**
 * Unit Price & Multi-tier Discount Comparator Engine
 */

window.ComparatorTool = {
  // Compare 2 items by weight/volume/units to find best value per unit
  comparePackages(pkgA, pkgB) {
    const priceA = parseFloat(pkgA.price) || 0;
    const qtyA = parseFloat(pkgA.quantity) || 1;

    const priceB = parseFloat(pkgB.price) || 0;
    const qtyB = parseFloat(pkgB.quantity) || 1;

    if (priceA <= 0 || qtyA <= 0 || priceB <= 0 || qtyB <= 0) {
      return null;
    }

    const unitPriceA = priceA / qtyA;
    const unitPriceB = priceB / qtyB;

    let winner = 'equal';
    let savingsPercent = 0;
    let diffPerUnit = Math.abs(unitPriceA - unitPriceB);

    if (unitPriceA < unitPriceB) {
      winner = 'A';
      savingsPercent = ((unitPriceB - unitPriceA) / unitPriceB) * 100;
    } else if (unitPriceB < unitPriceA) {
      winner = 'B';
      savingsPercent = ((unitPriceA - unitPriceB) / unitPriceA) * 100;
    }

    return {
      unitPriceA,
      unitPriceB,
      winner, // 'A', 'B', or 'equal'
      savingsPercent: Math.round(savingsPercent * 10) / 10,
      diffPerUnit: Math.round(diffPerUnit * 100) / 100
    };
  },

  // Calculate multi-tier discount result
  calculateTierDiscount(basePrice, disc1, disc2 = 0, cashback = 0) {
    const price = parseFloat(basePrice) || 0;
    const d1 = parseFloat(disc1) || 0;
    const d2 = parseFloat(disc2) || 0;
    const cb = parseFloat(cashback) || 0;

    const afterD1 = price * (1 - d1 / 100);
    const afterD2 = afterD1 * (1 - d2 / 100);
    const finalPrice = Math.max(0, afterD2 - cb);
    const totalDiscountAmount = price - finalPrice;
    const effectiveDiscountPercent = price > 0 ? (totalDiscountAmount / price) * 100 : 0;

    return {
      finalPrice: Math.round(finalPrice),
      totalDiscountAmount: Math.round(totalDiscountAmount),
      effectiveDiscountPercent: Math.round(effectiveDiscountPercent * 10) / 10
    };
  }
};
