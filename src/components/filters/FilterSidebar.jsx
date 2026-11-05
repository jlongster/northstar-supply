import React from "react";
import { FilterGroup } from "./FilterGroup.jsx";

export function FilterSidebar(props) {
  var headingId = React.useId();
  var stockToggleId = React.useId();
  var filters = props.filters;
  return (
    <aside className="ns-sidebar" aria-labelledby={headingId}>
      <h2 id={headingId} className="ns-sidebar-title">
        Filters
      </h2>
      <div className="ns-stock-toggle">
        <input
          type="checkbox"
          id={stockToggleId}
          name="in_stock"
          defaultChecked={Boolean(props.inStockOnly)}
        />
        <label htmlFor={stockToggleId}>In-stock items only</label>
      </div>
      {filters.map(function (group) {
        return <FilterGroup key={group.id} group={group} />;
      })}
    </aside>
  );
}
