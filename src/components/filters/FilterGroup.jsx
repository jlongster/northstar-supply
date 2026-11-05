import React from "react";
import { FilterOption } from "./FilterOption.jsx";

export function FilterGroup(props) {
  var group = props.group;
  return (
    <fieldset
      className="ns-filter-group"
      disabled={Boolean(group.disabled)}
      data-filter-key={group.id}
    >
      <legend className="ns-filter-legend">{group.title}</legend>
      {group.options.length === 0 ? (
        <p className="ns-filter-empty">No options</p>
      ) : (
        <ul className="ns-filter-list">
          {group.options.map(function (opt) {
            return (
              <FilterOption
                key={opt.value}
                groupId={group.id}
                groupDisabled={group.disabled}
                option={opt}
              />
            );
          })}
        </ul>
      )}
    </fieldset>
  );
}
