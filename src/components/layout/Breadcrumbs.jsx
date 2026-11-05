import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { cx } from "../../lib/classNames.js";

export function Breadcrumbs(props) {
  var nav = React.useContext(NavContext);
  var crumbs = props.breadcrumbs;
  if (!crumbs || crumbs.length === 0) {
    return null;
  }
  return (
    <nav className="ns-crumbs ns-container" aria-label="Breadcrumb">
      <ol className="ns-crumb-list">
        {crumbs.map(function (crumb, idx) {
          var isLast = idx === crumbs.length - 1;
          return (
            <li
              key={crumb.href + ":" + idx}
              className={cx("ns-crumb-item", { "is-current": isLast })}
            >
              {isLast ? (
                <span aria-current="page">{crumb.label}</span>
              ) : (
                <a href={nav.base + crumb.href}>{crumb.label}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
