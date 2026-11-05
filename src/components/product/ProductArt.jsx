import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { cx } from "../../lib/classNames.js";

// Category illustration (public/art/<category>.svg) on a tinted panel. The image is decorative:
// the product title next to it says what it is.
export function ProductArt(props) {
  var nav = React.useContext(NavContext);
  var size = props.size || "card";
  return (
    <div className={cx("ns-art", "ns-art-" + size, "ns-art-cat-" + props.category)}>
      <img
        src={nav.assets + "/art/" + props.category + ".svg"}
        alt=""
        width={size === "large" ? 560 : size === "thumb" ? 72 : 320}
        height={size === "large" ? 420 : size === "thumb" ? 54 : 240}
        loading={props.eager ? undefined : "lazy"}
        decoding="async"
      />
    </div>
  );
}
