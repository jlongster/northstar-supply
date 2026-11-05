import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { cx } from "../../lib/classNames.js";
import { Icon } from "../ui/Icon.jsx";

export function CartLink(props) {
  var nav = React.useContext(NavContext);
  var count = props.count;
  return (
    <a
      href={nav.base + "/cart"}
      className={cx("ns-header-link", "ns-cart-link", { "is-current": nav.view === "cart" })}
      aria-label={"Cart, " + count + (count === 1 ? " item" : " items")}
    >
      <Icon name="cart" />
      <span className="ns-header-link-label">Cart</span>
      <span className="ns-cart-count" hidden={count === 0}>
        {count}
      </span>
    </a>
  );
}
