// Cart totals: subtotal, loyalty discount (vip 10%, pro 5%), account credit, free-shipping
// threshold, and tax on the discounted amount. An empty cart totals zero (account credit only
// applies to an order).
export function computeCartTotals(cart, user) {
  var subtotal = 0;
  var unitCount = 0;
  for (var i = 0; i < cart.items.length; i++) {
    var it = cart.items[i];
    subtotal += it.qty * it.unitPrice;
    unitCount += it.qty;
  }
  var discountRate =
    user && user.tier === "vip"
      ? 0.1
      : user && user.tier === "pro"
      ? 0.05
      : 0;
  var memberDiscount = subtotal > 0 ? -(subtotal * discountRate) : 0;
  var credit = unitCount > 0 ? cart.creditAdjustment : 0;
  var afterDiscount = subtotal + memberDiscount + credit;
  var taxable = afterDiscount > 0 ? afterDiscount : 0;
  var freeShipping = taxable >= cart.freeShippingThreshold;
  var shipping = unitCount === 0 || freeShipping ? 0 : 14.95;
  var tax = taxable * cart.taxRate;
  var remaining = freeShipping ? 0 : cart.freeShippingThreshold - taxable;
  var progress =
    cart.freeShippingThreshold > 0
      ? Math.min(100, Math.round((taxable / cart.freeShippingThreshold) * 100))
      : 100;
  return {
    subtotal: subtotal,
    unitCount: unitCount,
    memberDiscount: memberDiscount,
    credit: credit,
    shipping: shipping,
    tax: tax,
    grandTotal: taxable + shipping + tax,
    freeShippingRemaining: remaining,
    freeShippingProgress: progress,
  };
}
