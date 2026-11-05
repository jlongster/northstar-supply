import React from "react";
import { formatDateUTC } from "../../lib/dates.js";
import { ActionButton } from "../ui/ActionButton.jsx";
import { PriceBlock } from "./PriceBlock.jsx";
import { StockBadge } from "./StockBadge.jsx";

// "Deal of the Day" banner above the product grid.
export function HeroSpotlight(props) {
  var spot = props.spotlight;
  if (!spot) {
    return null;
  }
  var ctaExtra = { "data-spotlight-sku": spot.sku };
  return (
    <section className="ns-spotlight" data-sku={spot.sku}>
      <div className="ns-spotlight-body">
        <span className="ns-spotlight-kicker">Deal of the Day</span>
        <h2 className="ns-spotlight-title">{spot.headline}</h2>
        {spot.blurb ? <p className="ns-spotlight-blurb">{spot.blurb}</p> : null}
        <p className="ns-spotlight-ends">
          Ends {formatDateUTC(spot.endsAtSec, true)}
        </p>
      </div>
      <div className="ns-spotlight-aside">
        <PriceBlock
          price={spot.price}
          originalPrice={spot.originalPrice}
        />
        <StockBadge stock={spot.stock} />
        <ActionButton
          variant="primary"
          disabled={spot.stock <= 0}
          extraAttrs={ctaExtra}
        >
          View Deal
        </ActionButton>
      </div>
    </section>
  );
}
