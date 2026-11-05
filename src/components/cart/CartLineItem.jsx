import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { formatMoney } from "../../lib/money.js";

export function CartLineItem(props) {
  var item = props.item;
  var locale = React.useContext(LocaleContext);
  var lineTotal = item.qty * item.unitPrice;
  return (
    <li className="ns-cart-item" data-sku={item.sku}>
      <div className="ns-cart-item-main">
        <span className="ns-cart-item-title">{item.title}</span>
        {item.backordered ? (
          <span className="ns-cart-backorder">Backorder</span>
        ) : null}
      </div>
      <div className="ns-cart-item-math">
        {item.qty} × {formatMoney(item.unitPrice, locale)} ={" "}
        <strong>{formatMoney(lineTotal, locale)}</strong>
      </div>
    </li>
  );
}
