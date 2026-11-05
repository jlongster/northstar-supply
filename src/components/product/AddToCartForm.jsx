import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { ActionButton } from "../ui/ActionButton.jsx";

// Posts to <base>/cart/add; the server updates the cart cookie and redirects back here.
export function AddToCartForm(props) {
  var nav = React.useContext(NavContext);
  var inStock = props.stock > 0;
  var qtyId = React.useId();
  var btnExtra = {
    "data-add-sku": props.sku,
    "aria-label": (inStock ? "Add to cart: " : "Out of stock: ") + props.title,
  };
  return (
    <form
      className={props.withQty ? "ns-add ns-add-full" : "ns-add"}
      method="post"
      action={nav.base + "/cart/add"}
    >
      <input type="hidden" name="sku" value={props.sku} />
      <input type="hidden" name="back" value={nav.current} />
      {props.withQty ? (
        <div className="ns-qty">
          <label htmlFor={qtyId}>Qty</label>
          <input
            id={qtyId}
            type="number"
            name="qty"
            min={1}
            max={99}
            defaultValue={1}
            disabled={!inStock}
            inputMode="numeric"
          />
        </div>
      ) : null}
      <ActionButton
        type="submit"
        variant={props.withQty ? "primary" : "secondary"}
        size={props.withQty ? "lg" : "sm"}
        disabled={!inStock}
        extraAttrs={btnExtra}
      >
        {inStock ? "Add to cart" : "Out of stock"}
      </ActionButton>
    </form>
  );
}
