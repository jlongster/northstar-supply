import React from "react";
import { EmptyCatalogState } from "./EmptyCatalogState.jsx";
import { ProductCard } from "./ProductCard.jsx";

export function ProductGrid(props) {
  var products = props.products;
  if (products.length === 0) {
    return <EmptyCatalogState query={props.query} />;
  }
  return (
    <div className="ns-grid" data-count={products.length}>
      {products.map(function (product, index) {
        return (
          <ProductCard key={product.sku} product={product} index={index} />
        );
      })}
    </div>
  );
}
