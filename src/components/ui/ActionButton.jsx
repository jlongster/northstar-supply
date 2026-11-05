import React from "react";
import { cx } from "../../lib/classNames.js";

// Spreads `extraAttrs` onto the <button>, then overrides type/className/disabled/data-variant.
export function ActionButton(props) {
  var variant = props.variant || "primary";
  var className = cx(
    "ns-btn",
    "ns-btn-" + variant,
    props.size && "ns-btn-" + props.size,
    props.className
  );
  var btnProps = Object.assign({}, props.extraAttrs, {
    type: props.type || "button",
    className: className,
    disabled: Boolean(props.disabled),
    "data-variant": variant,
  });
  return <button {...btnProps}>{props.children}</button>;
}
