import React from "react";
import { formatShortDate } from "../../lib/dates.js";

export function StockBadge(props) {
  var stock = props.stock;
  if (stock <= 0) {
    return (
      <p className="ns-stock ns-stock-out" data-stock-state="out">
        Out of stock
      </p>
    );
  }
  if (stock <= 5) {
    return (
      <p className="ns-stock ns-stock-low" data-stock-state="low">
        Only {stock} left
        {typeof props.shipsAtSec === "number"
          ? " · Ships " + formatShortDate(props.shipsAtSec)
          : ""}
      </p>
    );
  }
  return (
    <p className="ns-stock ns-stock-in" data-stock-state="in">
      In stock
      {typeof props.shipsAtSec === "number"
        ? " · Ships " + formatShortDate(props.shipsAtSec)
        : ""}
    </p>
  );
}
