import React from "react";
import { ProductCard } from "./ProductCard.jsx";

export function ProductGrid(props) {
  var products = props.products;
  return (
    <div className={props.compact ? "ns-grid ns-grid-4" : "ns-grid"} data-count={products.length}>
      {products.map(function (product, index) {
        return (
          <ProductCard key={product.sku} product={product} index={index} />
        );
      })}
    </div>
  );
}
