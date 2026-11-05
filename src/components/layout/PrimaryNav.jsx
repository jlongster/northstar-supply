import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { cx } from "../../lib/classNames.js";

export function NavItem(props) {
  var nav = React.useContext(NavContext);
  var cat = props.category;
  var active = props.active;
  return (
    <li className={cx("ns-nav-item", { "is-active": active, "is-hot": Boolean(cat.hot) })}>
      <a
        href={nav.base + "/c/" + cat.slug}
        aria-current={active ? "page" : undefined}
        data-category={cat.slug}
      >
        {cat.label}
      </a>
    </li>
  );
}

export function PrimaryNav(props) {
  var nav = React.useContext(NavContext);
  var categories = props.categories;
  if (!categories || categories.length === 0) {
    return null;
  }
  var allActive = nav.view === "listing" && nav.path === "/shop";
  return (
    <nav className="ns-nav" aria-label="Categories">
      <ul className="ns-nav-list ns-container">
        <li className={cx("ns-nav-item", { "is-active": allActive })}>
          <a href={nav.base + "/shop"} aria-current={allActive ? "page" : undefined}>
            All products
          </a>
        </li>
        {categories.map(function (cat) {
          return (
            <NavItem
              key={cat.id}
              category={cat}
              active={cat.slug === props.activeSlug}
            />
          );
        })}
      </ul>
    </nav>
  );
}
