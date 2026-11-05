import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { formatMoney } from "../../lib/money.js";
import { ActionButton } from "../ui/ActionButton.jsx";

export function CartSummaryAside(props) {
  var cart = props.cart;
  var totals = props.totals;
  var locale = React.useContext(LocaleContext);
  var isEmpty = cart.items.length === 0;
  return (
    <aside className="ns-summary" data-empty={isEmpty} aria-labelledby="ns-summary-title">
      <h2 className="ns-summary-title" id="ns-summary-title">
        Order summary
      </h2>
      <div className="ns-ship-meter">
        <p>
          {totals.freeShippingRemaining > 0
            ? "Add " + formatMoney(totals.freeShippingRemaining, locale) + " more for free shipping"
            : "Your order ships free"}
        </p>
        <span className="ns-ship-track" aria-hidden="true">
          <span className="ns-ship-fill" style={{ width: totals.freeShippingProgress + "%" }} />
        </span>
      </div>
      <dl className="ns-summary-rows">
        <dt>
          Subtotal ({totals.unitCount} {totals.unitCount === 1 ? "item" : "items"})
        </dt>
        <dd>{formatMoney(totals.subtotal, locale)}</dd>
        {totals.memberDiscount !== 0 ? (
          <>
            <dt>Member discount</dt>
            <dd className="ns-summary-credit">{formatMoney(totals.memberDiscount, locale)}</dd>
          </>
        ) : null}
        {totals.credit !== 0 ? (
          <>
            <dt>Account credit</dt>
            <dd className="ns-summary-credit">{formatMoney(totals.credit, locale)}</dd>
          </>
        ) : null}
        <dt>Shipping</dt>
        <dd>
          {totals.shipping === 0
            ? "Free"
            : formatMoney(totals.shipping, locale)}
        </dd>
        <dt>Estimated tax</dt>
        <dd>{formatMoney(totals.tax, locale)}</dd>
        <dt className="ns-summary-total-label">Total</dt>
        <dd className="ns-summary-total">
          {formatMoney(totals.grandTotal, locale)}
        </dd>
      </dl>
      <ActionButton variant="primary" size="lg" disabled={true} className="ns-btn-block">
        Checkout
      </ActionButton>
      <p className="ns-summary-note">Checkout is disabled in this demo store.</p>
      <details className="ns-summary-terms" open={Boolean(cart.notesOpen)}>
        <summary>Shipping &amp; trade terms</summary>
        <p>
          Orders over {formatMoney(cart.freeShippingThreshold, locale)} ship free. Trade accounts can
          pay on Net-30 terms.
        </p>
      </details>
    </aside>
  );
}
