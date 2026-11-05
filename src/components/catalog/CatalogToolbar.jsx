import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { NavContext } from "../../context/NavContext.js";
import { formatInt } from "../../lib/numbers.js";
import { Icon } from "../ui/Icon.jsx";

export function CatalogToolbar(props) {
  var sortId = React.useId();
  var nav = React.useContext(NavContext);
  var locale = React.useContext(LocaleContext);
  var pag = props.pagination;
  var stats = props.stats;
  return (
    <div className="ns-toolbar">
      <p className="ns-toolbar-summary">
        {pag.totalMatching === 0 ? (
          "0 products"
        ) : (
          <>
            Showing{" "}
            <strong>
              {formatInt(pag.firstIndex, locale.groupSep)}–{formatInt(pag.lastIndex, locale.groupSep)}
            </strong>{" "}
            of <strong>{formatInt(pag.totalMatching, locale.groupSep)}</strong>
            {stats.onSaleCount > 0 ? " · " + stats.onSaleCount + " on sale" : ""}
          </>
        )}
      </p>
      <div className="ns-toolbar-sort">
        <label htmlFor={sortId}>Sort by</label>
        <select id={sortId} name="sort" form="ns-filter-form" defaultValue={props.sortBy}>
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
        <button type="submit" form="ns-filter-form" className="ns-btn ns-btn-secondary ns-btn-sm ns-nojs">
          Sort
        </button>
      </div>
      {props.activeFilters.length > 0 ? (
        <ul className="ns-chips" aria-label="Active filters">
          {props.activeFilters.map(function (f) {
            return (
              <li key={f.key}>
                <a className="ns-chip" href={nav.base + f.href} aria-label={"Remove filter: " + f.label}>
                  {f.label}
                  <Icon name="close" size={14} />
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
