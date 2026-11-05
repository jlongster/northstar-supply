import React from "react";
import { cx } from "../../lib/classNames.js";
import { CountPill } from "../ui/CountPill.jsx";

export function NavItem(props) {
  var cat = props.category;
  var active = props.active;
  return (
    <li className={cx("ns-nav-item", { "is-active": active })}>
      <a
        href={"/c/" + cat.slug}
        aria-current={active ? "page" : undefined}
        data-category={cat.slug}
      >
        <span className="ns-nav-label">{cat.label}</span>
        <CountPill count={cat.count} hot={cat.hot} />
      </a>
    </li>
  );
}

export function PrimaryNav(props) {
  var categories = props.categories;
  if (!categories || categories.length === 0) {
    return null;
  }
  return (
    <nav className="ns-nav" aria-label="Categories">
      <ul className="ns-nav-list">
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
