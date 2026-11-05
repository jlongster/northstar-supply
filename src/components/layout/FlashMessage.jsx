import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { Icon } from "../ui/Icon.jsx";

// One-time confirmation after a form post (added to cart, signed in, ...).
export function FlashMessage(props) {
  var nav = React.useContext(NavContext);
  var flash = props.flash;
  if (!flash) {
    return null;
  }
  return (
    <div className="ns-flash ns-container" role="status">
      <p className="ns-flash-inner">
        <Icon name="check" size={18} />
        <span className="ns-flash-text">{flash.text}</span>
        {flash.cartLink ? (
          <a className="ns-flash-link" href={nav.base + "/cart"}>
            View cart
          </a>
        ) : null}
      </p>
    </div>
  );
}
