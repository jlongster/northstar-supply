// Summary counts for the catalog toolbar.
export function computeCatalogStats(products) {
  var inStockCount = 0;
  var onSaleCount = 0;
  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    if (p.stock > 0) inStockCount++;
    if (typeof p.originalPrice === "number" && p.originalPrice > p.price) {
      onSaleCount++;
    }
  }
  return {
    visibleCount: products.length,
    inStockCount: inStockCount,
    onSaleCount: onSaleCount,
  };
}
