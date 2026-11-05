// Quote totals: subtotal, loyalty discount (vip 10%, pro 5%), account credit, free-shipping
// threshold, and tax on the discounted amount.
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
  var afterDiscount = subtotal + memberDiscount + cart.creditAdjustment;
  var taxable = afterDiscount > 0 ? afterDiscount : 0;
  var shipping =
    unitCount === 0 || taxable >= cart.freeShippingThreshold ? 0 : 14.95;
  var tax = taxable * cart.taxRate;
  var grandTotal = afterDiscount + shipping + tax;
  return {
    subtotal: subtotal,
    unitCount: unitCount,
    memberDiscount: memberDiscount,
    shipping: shipping,
    tax: tax,
    grandTotal: grandTotal,
  };
}
