import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { cx } from "../../lib/classNames.js";
import { AddToCartForm } from "./AddToCartForm.jsx";
import { PriceBlock } from "./PriceBlock.jsx";
import { ProductArt } from "./ProductArt.jsx";
import { ProductBadges } from "./ProductBadges.jsx";
import { StarRating } from "./StarRating.jsx";
import { StockBadge } from "./StockBadge.jsx";

// The title link stretches over the whole card (CSS), so the card is one click target; the
// add-to-cart form sits above it.
export function ProductCard(props) {
  var nav = React.useContext(NavContext);
  var p = props.product;
  var inStock = p.stock > 0;
  var cardDataAttrs = {
    "data-sku": p.sku,
    "data-category": p.category,
    "data-in-stock": inStock,
    "data-featured": Boolean(p.featured),
  };
  return (
    <article
      {...cardDataAttrs}
      className={cx("ns-card", {
        "ns-card-featured": Boolean(p.featured),
        "ns-card-out": !inStock,
      })}
    >
      <div className="ns-card-media">
        <ProductArt category={p.category} eager={props.index < 4} />
        <ProductBadges product={p} />
      </div>
      <div className="ns-card-body">
        <p className="ns-card-brand">{p.brand}</p>
        <h3 className="ns-card-title">
          <a className="ns-card-link" href={nav.base + "/p/" + p.sku}>
            {p.title}
          </a>
        </h3>
        <StarRating rating={p.rating} reviewCount={p.reviewCount} />
        <PriceBlock
          price={p.price}
          originalPrice={p.originalPrice}
          rebateAmount={p.rebateAmount}
        />
        <StockBadge stock={p.stock} shipsAtSec={p.shipsAtSec} />
      </div>
      <div className="ns-card-actions">
        <AddToCartForm sku={p.sku} title={p.title} stock={p.stock} />
      </div>
    </article>
  );
}
