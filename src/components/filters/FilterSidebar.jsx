import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { FilterGroup } from "./FilterGroup.jsx";

// The listing's GET form. The sort <select> in the toolbar joins it through form="ns-filter-form",
// so one submit carries the query, sort and every filter. With JavaScript, changes submit
// immediately (the Apply button is then hidden); without it, Apply submits.
export function FilterSidebar(props) {
  var nav = React.useContext(NavContext);
  var headingId = React.useId();
  var stockToggleId = React.useId();
  var filters = props.filters;
  return (
    <aside className="ns-sidebar" aria-labelledby={headingId}>
      <details className="ns-filters" open={true}>
        <summary className="ns-filters-summary">
          Filters
          {props.activeCount > 0 ? (
            <span className="ns-filters-count">{props.activeCount}</span>
          ) : null}
        </summary>
        <form
          id="ns-filter-form"
          className="ns-filter-form"
          method="get"
          action={nav.base + nav.path}
          data-autosubmit="true"
        >
          <h2 id={headingId} className="ns-sidebar-title">
            Filters
          </h2>
          {props.query ? <input type="hidden" name="q" value={props.query} /> : null}
          <fieldset className="ns-filter-group">
            <legend className="ns-filter-legend">Availability</legend>
            <div className="ns-filter-opt">
              <input
                type="checkbox"
                id={stockToggleId}
                name="in_stock"
                value="1"
                defaultChecked={Boolean(props.inStockOnly)}
              />
              <label htmlFor={stockToggleId}>In stock only</label>
            </div>
          </fieldset>
          {filters.map(function (group) {
            return <FilterGroup key={group.id} group={group} />;
          })}
          <div className="ns-filter-actions">
            <button type="submit" className="ns-btn ns-btn-secondary ns-btn-sm ns-nojs">
              Apply filters
            </button>
            {props.activeCount > 0 ? (
              <a className="ns-filter-clear" href={nav.base + props.clearHref}>
                Clear all
              </a>
            ) : null}
          </div>
        </form>
      </details>
    </aside>
  );
}
