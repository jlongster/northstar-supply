import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { formatInt } from "../../lib/numbers.js";

export function StarRating(props) {
  var rating = props.rating;
  var count = props.reviewCount;
  var clamped = rating < 0 ? 0 : rating > 5 ? 5 : rating;
  var pct = Math.round((clamped / 5) * 100);
  var locale = React.useContext(LocaleContext);
  return (
    <div
      className="ns-rating"
      aria-label={"Rated " + clamped.toFixed(1) + " out of 5"}
    >
      <span className="ns-rating-track" aria-hidden="true">
        <span
          className="ns-rating-fill"
          style={{
            width: pct + "%",
            opacity: count > 0 ? 1 : 0.35,
          }}
        />
      </span>
      <span className="ns-rating-num">{clamped.toFixed(1)}</span>
      <span className="ns-rating-count">
        ({formatInt(count, locale.groupSep)})
      </span>
    </div>
  );
}
