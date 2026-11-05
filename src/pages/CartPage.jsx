import React from "react";
import { CartLineItem } from "../components/cart/CartLineItem.jsx";
import { CartSummaryAside } from "../components/cart/CartSummaryAside.jsx";
import { NavContext } from "../context/NavContext.js";

export function CartPage(props) {
  var nav = React.useContext(NavContext);
  var cart = props.cart;
  var isEmpty = cart.items.length === 0;
  return (
    <div className="ns-cart-page ns-container">
      <header className="ns-page-head">
        <h1 className="ns-page-title">Your cart</h1>
      </header>
      {isEmpty ? (
        <div className="ns-empty" role="status">
          <div className="ns-empty-art" aria-hidden="true" />
          <h2 className="ns-empty-title">Your cart is empty</h2>
          <p className="ns-empty-desc">Add tools from the catalog and they will show up here.</p>
          <div className="ns-empty-actions">
            <a className="ns-btn ns-btn-primary" href={nav.base + "/shop"}>
              Browse products
            </a>
          </div>
        </div>
      ) : (
        <div className="ns-cart-layout">
          <ul className="ns-cart-list" aria-label="Items in your cart">
            {cart.items.map(function (it) {
              return <CartLineItem key={it.sku} item={it} />;
            })}
          </ul>
          <CartSummaryAside cart={cart} totals={props.totals} />
        </div>
      )}
    </div>
  );
}
