import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { UserContext } from "../../context/UserContext.js";
import { computeCartTotals } from "../../lib/cart.js";
import { formatMoney } from "../../lib/money.js";
import { ActionButton } from "../ui/ActionButton.jsx";
import { CartLineItem } from "./CartLineItem.jsx";

export function CartSummaryAside(props) {
  var cart = props.cart;
  var locale = React.useContext(LocaleContext);
  var user = React.useContext(UserContext);

  var totals = React.useMemo(
    function () {
      return computeCartTotals(cart, user);
    },
    [cart, user]
  );

  var isEmpty = cart.items.length === 0;
  var showBreakdown = !isEmpty || cart.creditAdjustment !== 0;
  return (
    <aside className="ns-cart" data-empty={isEmpty}>
      <h2 className="ns-cart-title">Order Quote ({totals.unitCount})</h2>
      {isEmpty ? (
        <p className="ns-cart-empty">Your quote list is empty.</p>
      ) : (
        <ul className="ns-cart-list">
          {cart.items.map(function (it) {
            return <CartLineItem key={it.sku} item={it} />;
          })}
        </ul>
      )}
      {showBreakdown ? (
        <dl className="ns-cart-totals">
          <dt>Subtotal</dt>
          <dd>{formatMoney(totals.subtotal, locale)}</dd>
          {totals.memberDiscount !== 0 ? (
            <>
              <dt>Member Discount</dt>
              <dd>{formatMoney(totals.memberDiscount, locale)}</dd>
            </>
          ) : null}
          {cart.creditAdjustment !== 0 ? (
            <>
              <dt>Account Credit</dt>
              <dd>{formatMoney(cart.creditAdjustment, locale)}</dd>
            </>
          ) : null}
          <dt>Shipping</dt>
          <dd>
            {totals.shipping === 0
              ? "FREE"
              : formatMoney(totals.shipping, locale)}
          </dd>
          <dt>Est. Tax</dt>
          <dd>{formatMoney(totals.tax, locale)}</dd>
          <dt className="ns-cart-grand-label">Total</dt>
          <dd className="ns-cart-grand-val">
            {formatMoney(totals.grandTotal, locale)}
          </dd>
        </dl>
      ) : null}
      <details className="ns-cart-notes" open={Boolean(cart.notesOpen)}>
        <summary>Freight &amp; Net-30 Terms</summary>
        <p>Orders above {formatMoney(cart.freeShippingThreshold, locale)} ship free.</p>
      </details>
      <ActionButton variant="primary" disabled={isEmpty}>
        Proceed to Checkout
      </ActionButton>
    </aside>
  );
}
