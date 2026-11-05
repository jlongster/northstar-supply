import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { cx } from "../../lib/classNames.js";
import { formatInt } from "../../lib/numbers.js";

export function CountPill(props) {
  var locale = React.useContext(LocaleContext);
  var count = props.count;
  return (
    <span
      className={cx("ns-pill", { "ns-pill-hot": Boolean(props.hot) })}
      hidden={count <= 0}
      data-zero={count === 0}
    >
      {formatInt(count, locale.groupSep)}
    </span>
  );
}
