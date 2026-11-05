import React from "react";
import { cx } from "../../lib/classNames.js";
import { CountPill } from "../ui/CountPill.jsx";

export function FilterOption(props) {
  var opt = props.option;
  var optId = React.useId();
  var disabled = Boolean(props.groupDisabled || opt.count === 0);
  return (
    <li className={cx("ns-filter-opt", { "is-selected": opt.selected })}>
      <input
        type="checkbox"
        id={optId}
        name={"f_" + props.groupId}
        value={opt.value}
        defaultChecked={Boolean(opt.selected)}
        disabled={disabled}
      />
      <label htmlFor={optId}>{opt.label}</label>
      <CountPill count={opt.count} hot={false} />
    </li>
  );
}
