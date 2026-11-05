import React from "react";
import { formatDateUTC } from "../../lib/dates.js";

export function StockBadge(props) {
  var stock = props.stock;
  if (stock <= 0) {
    return (
      <span className="ns-stock ns-stock-out" data-stock-state="out">
        Out of stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="ns-stock ns-stock-low" data-stock-state="low">
        Only {stock} left
      </span>
    );
  }
  return (
    <span className="ns-stock ns-stock-in" data-stock-state="in">
      In stock
      {typeof props.shipsAtSec === "number"
        ? " · Ships " + formatDateUTC(props.shipsAtSec, false)
        : ""}
    </span>
  );
}
