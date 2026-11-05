import React from "react";
import { ProductDetail } from "../components/product/ProductDetail.jsx";
import { ProductGrid } from "../components/product/ProductGrid.jsx";

export function ProductPage(props) {
  var product = props.product;
  return (
    <div className="ns-product-page ns-container">
      <ProductDetail
        product={product}
        specs={props.specs}
        freeShippingThreshold={props.cart.freeShippingThreshold}
      />
      {props.related.length > 0 ? (
        <section className="ns-section" aria-labelledby="ns-related-title">
          <div className="ns-section-head">
            <h2 className="ns-section-heading" id="ns-related-title">
              Related tools
            </h2>
          </div>
          <ProductGrid products={props.related} compact={true} />
        </section>
      ) : null}
    </div>
  );
}
