import React from "react";
import { cx } from "../../lib/classNames.js";
import { CountPill } from "../ui/CountPill.jsx";

// A zero-count option stays enabled when it is selected, so it can be unchecked.
export function FilterOption(props) {
  var opt = props.option;
  var optId = React.useId();
  var disabled = Boolean(props.groupDisabled || (opt.count === 0 && !opt.selected));
  return (
    <li className={cx("ns-filter-opt", { "is-selected": opt.selected, "is-disabled": disabled })}>
      <input
        type="checkbox"
        id={optId}
        name={props.groupId}
        value={opt.value}
        defaultChecked={Boolean(opt.selected)}
        disabled={disabled}
      />
      <label htmlFor={optId}>{opt.label}</label>
      <CountPill count={opt.count} hot={false} />
    </li>
  );
}
