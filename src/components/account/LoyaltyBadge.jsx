import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { cx } from "../../lib/classNames.js";
import { formatInt } from "../../lib/numbers.js";

export function LoyaltyBadge(props) {
  var locale = React.useContext(LocaleContext);
  var tier = props.tier || "member";
  return (
    <span
      className={cx("ns-tier", "ns-tier-" + tier)}
      data-tier={tier}
      data-points={props.points}
    >
      {tier.toUpperCase()} ({formatInt(props.points, locale.groupSep)} pts)
    </span>
  );
}
