import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { NavContext } from "../../context/NavContext.js";
import { formatMoney } from "../../lib/money.js";
import { ProductArt } from "../product/ProductArt.jsx";

// One cart row with its own form: change the quantity (Update) or remove the line.
export function CartLineItem(props) {
  var item = props.item;
  var nav = React.useContext(NavContext);
  var locale = React.useContext(LocaleContext);
  var qtyId = React.useId();
  var lineTotal = item.qty * item.unitPrice;
  return (
    <li className="ns-cart-item" data-sku={item.sku}>
      <ProductArt category={item.category || "hand-tools"} size="thumb" />
      <div className="ns-cart-item-main">
        <a className="ns-cart-item-title" href={nav.base + "/p/" + item.sku}>
          {item.title}
        </a>
        <p className="ns-cart-item-meta">
          SKU {item.sku} · {formatMoney(item.unitPrice, locale)} each
        </p>
        {item.backordered ? (
          <p className="ns-cart-backorder">Backordered: ships when restocked</p>
        ) : null}
      </div>
      <form className="ns-cart-item-qty" method="post" action={nav.base + "/cart/update"}>
        <input type="hidden" name="sku" value={item.sku} />
        <label className="ns-sr-only" htmlFor={qtyId}>
          Quantity
        </label>
        <input
          id={qtyId}
          type="number"
          name="qty"
          min={1}
          max={99}
          defaultValue={item.qty}
          inputMode="numeric"
        />
        <button type="submit" className="ns-btn ns-btn-secondary ns-btn-sm">
          Update
        </button>
        <button type="submit" name="remove" value="1" className="ns-btn ns-btn-ghost ns-btn-sm">
          Remove
        </button>
      </form>
      <p className="ns-cart-item-total">{formatMoney(lineTotal, locale)}</p>
    </li>
  );
}
