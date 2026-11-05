import React from "react";
import { NavContext } from "../context/NavContext.js";

export function NotFoundPage(props) {
  var nav = React.useContext(NavContext);
  return (
    <div className="ns-container">
      <div className="ns-empty ns-notfound" role="status">
        <p className="ns-eyebrow">Error 404</p>
        <h1 className="ns-empty-title">We couldn’t find that page</h1>
        <p className="ns-empty-desc">
          The link may be out of date, or the product is no longer stocked. Try searching, or
          start from a category.
        </p>
        <div className="ns-empty-actions">
          <a className="ns-btn ns-btn-primary" href={nav.base + "/"}>
            Go to the home page
          </a>
          <a className="ns-btn ns-btn-secondary" href={nav.base + "/shop"}>
            All products
          </a>
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
    </div>
  );
}
