import React from "react";
import { NavContext } from "../../context/NavContext.js";

// No products: suggests clearing filters (when some are active) and browsing a category.
export function EmptyCatalogState(props) {
  var nav = React.useContext(NavContext);
  return (
    <div className="ns-empty" role="status" data-query={props.query}>
      <div className="ns-empty-art" aria-hidden="true" />
      <h2 className="ns-empty-title">
        {props.query ? "No results for “" + props.query + "”" : "No products match these filters"}
      </h2>
      <p className="ns-empty-desc">
        {props.query
          ? "Check the spelling, use fewer words, or try a category below."
          : "Try removing a filter or browse another category."}
      </p>
      <div className="ns-empty-actions">
        {props.hasFilters ? (
          <a className="ns-btn ns-btn-primary" href={nav.base + props.clearHref}>
            Clear filters
          </a>
        ) : (
          <a className="ns-btn ns-btn-primary" href={nav.base + "/shop"}>
            Browse all products
          </a>
        )}
      </div>
      <ul className="ns-empty-cats" aria-label="Categories">
        {props.categories.map(function (cat) {
          return (
            <li key={cat.id}>
              <a href={nav.base + "/c/" + cat.slug}>{cat.label}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
