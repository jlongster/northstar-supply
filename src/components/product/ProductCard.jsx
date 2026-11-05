import React from "react";
import { ThemeContext } from "../../context/ThemeContext.js";
import { cx } from "../../lib/classNames.js";
import { getThemePalette } from "../../lib/theme.js";
import { ActionButton } from "../ui/ActionButton.jsx";
import { PriceBlock } from "./PriceBlock.jsx";
import { ProductBadges } from "./ProductBadges.jsx";
import { ReviewSnippet } from "./ReviewSnippet.jsx";
import { SpecList } from "./SpecList.jsx";
import { StarRating } from "./StarRating.jsx";
import { StockBadge } from "./StockBadge.jsx";

export function ProductCard(props) {
  var p = props.product;
  var theme = React.useContext(ThemeContext);
  var palette = getThemePalette(theme);
  var inStock = p.stock > 0;
  var cardDataAttrs = {
    "data-sku": p.sku,
    "data-category": p.category,
    "data-in-stock": inStock,
    "data-featured": Boolean(p.featured),
  };
  var btnExtra = {
    "data-add-sku": p.sku,
    "aria-label": (inStock ? "Add to cart: " : "Unavailable: ") + p.title,
  };
  return (
    <article
      {...cardDataAttrs}
      itemScope={true}
      className={cx("ns-card", {
        "ns-card-featured": Boolean(p.featured),
        "ns-card-out": !inStock,
      })}
      style={{
        borderColor: p.featured ? palette.accent : undefined,
        order: props.index,
      }}
    >
      <ProductBadges product={p} />
      <div className="ns-card-head">
        <span className="ns-card-brand">{p.brand}</span>
        <span className="ns-card-sku">#{p.sku}</span>
      </div>
      <h3 className="ns-card-title">
        <a href={"/p/" + p.sku} title={p.title}>
          {p.title}
        </a>
      </h3>
      <StarRating rating={p.rating} reviewCount={p.reviewCount} />
      <SpecList specs={p.specs} />
      <PriceBlock
        price={p.price}
        originalPrice={p.originalPrice}
        rebateAmount={p.rebateAmount}
      />
      <div className="ns-card-footer">
        <StockBadge stock={p.stock} shipsAtSec={p.shipsAtSec} />
        <ActionButton
          variant={inStock ? "primary" : "ghost"}
          size="sm"
          disabled={!inStock}
          extraAttrs={btnExtra}
        >
          {inStock ? "Add to Cart" : "Notify Me"}
        </ActionButton>
      </div>
      <ReviewSnippet review={p.topReview} />
    </article>
  );
}
