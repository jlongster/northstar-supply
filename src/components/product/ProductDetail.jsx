import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { cx } from "../../lib/classNames.js";
import { formatMoney } from "../../lib/money.js";
import { AddToCartForm } from "./AddToCartForm.jsx";
import { PriceBlock } from "./PriceBlock.jsx";
import { ProductArt } from "./ProductArt.jsx";
import { ProductBadges } from "./ProductBadges.jsx";
import { ReviewSnippet } from "./ReviewSnippet.jsx";
import { SpecList } from "./SpecList.jsx";
import { StarRating } from "./StarRating.jsx";
import { StockBadge } from "./StockBadge.jsx";

export function ProductDetail(props) {
  var p = props.product;
  var locale = React.useContext(LocaleContext);
  return (
    <section className="ns-pdp" data-sku={p.sku}>
      <div className="ns-pdp-media">
        <ProductArt category={p.category} art={p.art} size="large" eager={true} />
        <ProductBadges product={p} />
      </div>
      <div className="ns-pdp-info">
        <p className="ns-pdp-brand">{p.brand}</p>
        <h1 className="ns-pdp-title">{p.title}</h1>
        <div className="ns-pdp-meta">
          <StarRating rating={p.rating} reviewCount={p.reviewCount} />
          <span className="ns-pdp-sku">SKU {p.sku}</span>
        </div>
        <div className="ns-pdp-buy">
          <PriceBlock
            price={p.price}
            originalPrice={p.originalPrice}
            rebateAmount={p.rebateAmount}
            large={true}
          />
          <StockBadge stock={p.stock} shipsAtSec={p.shipsAtSec} />
          <AddToCartForm sku={p.sku} title={p.title} stock={p.stock} withQty={true} />
          <ul className="ns-pdp-perks">
            <li>Free shipping on orders over {formatMoney(props.freeShippingThreshold, locale)}</li>
            <li>30-day returns · 2-year warranty</li>
          </ul>
        </div>
        <div className={cx("ns-pdp-section", { "is-empty": props.specs.length === 0 })}>
          <h2 className="ns-section-title">Specifications</h2>
          <SpecList specs={props.specs} />
        </div>
        <div className="ns-pdp-section">
          <h2 className="ns-section-title">Description</h2>
          <p className="ns-pdp-desc">{p.description}</p>
        </div>
        {p.topReview ? (
          <div className="ns-pdp-section">
            <h2 className="ns-section-title">Top review</h2>
            <ReviewSnippet review={p.topReview} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
