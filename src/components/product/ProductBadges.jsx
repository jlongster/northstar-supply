import React from "react";

export function ProductBadges(props) {
  var p = props.product;
  var onSale =
    typeof p.originalPrice === "number" && p.originalPrice > p.price;
  if (!p.featured && !p.clearance && !onSale) {
    return null;
  }
  return (
    <div className="ns-badges">
      {p.clearance ? (
        <span className="ns-badge ns-badge-clearance">Clearance</span>
      ) : onSale ? (
        <span className="ns-badge ns-badge-sale">Sale</span>
      ) : null}
      {p.featured ? (
        <span className="ns-badge ns-badge-featured">Best seller</span>
      ) : null}
    </div>
  );
}
