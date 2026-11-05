import React from "react";
import { cx } from "../../lib/classNames.js";

export function Breadcrumbs(props) {
  var crumbs = props.breadcrumbs;
  if (!crumbs || crumbs.length === 0) {
    return null;
  }
  return (
    <nav className="ns-crumbs" aria-label="Breadcrumb">
      <ol className="ns-crumb-list">
        {crumbs.map(function (crumb, idx) {
          var isLast = idx === crumbs.length - 1;
          return (
            <React.Fragment key={crumb.href + ":" + idx}>
              {idx > 0 ? (
                <li className="ns-crumb-sep" aria-hidden="true">
                  /
                </li>
              ) : null}
              <li className={cx("ns-crumb-item", { "is-current": isLast })}>
                {isLast ? (
                  <span aria-current="page">{crumb.label}</span>
                ) : (
                  <a href={crumb.href}>{crumb.label}</a>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
