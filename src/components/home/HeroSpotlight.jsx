import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { formatShortDate } from "../../lib/dates.js";
import { AddToCartForm } from "../product/AddToCartForm.jsx";
import { PriceBlock } from "../product/PriceBlock.jsx";
import { ProductArt } from "../product/ProductArt.jsx";
import { StockBadge } from "../product/StockBadge.jsx";

// "Deal of the week" card next to the home page hero.
export function HeroSpotlight(props) {
  var nav = React.useContext(NavContext);
  var spot = props.spotlight;
  if (!spot) {
    return null;
  }
  return (
    <section className="ns-spotlight" data-sku={spot.sku} aria-labelledby="ns-spotlight-title">
      <div className="ns-spotlight-media">
        <ProductArt category={spot.category || "measuring"} eager={true} />
        <span className="ns-badge ns-badge-sale">Deal of the week</span>
      </div>
      <div className="ns-spotlight-body">
        <h2 className="ns-spotlight-title" id="ns-spotlight-title">
          <a href={nav.base + "/p/" + spot.sku}>{spot.headline}</a>
        </h2>
        {spot.blurb ? <p className="ns-spotlight-blurb">{spot.blurb}</p> : null}
        <PriceBlock price={spot.price} originalPrice={spot.originalPrice} />
        <StockBadge stock={spot.stock} />
        <p className="ns-spotlight-ends">
          Offer ends {formatShortDate(spot.endsAtSec)}
        </p>
        <AddToCartForm sku={spot.sku} title={spot.headline} stock={spot.stock} />
      </div>
    </section>
  );
}
