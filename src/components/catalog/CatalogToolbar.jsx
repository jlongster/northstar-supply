import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { formatInt } from "../../lib/numbers.js";

export function CatalogToolbar(props) {
  var sortId = React.useId();
  var locale = React.useContext(LocaleContext);
  var stats = props.stats;
  return (
    <div className="ns-toolbar">
      <p className="ns-toolbar-summary">
        Showing <strong>{formatInt(stats.visibleCount, locale.groupSep)}</strong>{" "}
        of <strong>{formatInt(props.totalMatching, locale.groupSep)}</strong>{" "}
        items ({stats.inStockCount} ready, {stats.onSaleCount} on sale)
      </p>
      <div className="ns-toolbar-sort">
        <label htmlFor={sortId}>Sort:</label>
        <select id={sortId} name="sort" defaultValue={props.sortBy}>
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Customer Rating</option>
        </select>
      </div>
    </div>
  );
}
