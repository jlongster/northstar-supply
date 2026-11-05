import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { UserMenu } from "../account/UserMenu.jsx";
import { ThemeToggle } from "../account/ThemeToggle.jsx";
import { CartLink } from "../cart/CartLink.jsx";
import { SearchBox } from "../search/SearchBox.jsx";
import { PrimaryNav } from "./PrimaryNav.jsx";

export function SiteHeader(props) {
  var nav = React.useContext(NavContext);
  return (
    <header className="ns-header">
      <div className="ns-header-top ns-container">
        <a href={nav.base + "/"} className="ns-brand" data-brand="northstar">
          <span className="ns-brand-mark" aria-hidden="true" />
          <span className="ns-brand-name">Northstar Supply</span>
        </a>
        <SearchBox search={props.search} />
        <div className="ns-header-actions">
          <ThemeToggle />
          <UserMenu />
          <CartLink count={props.cartCount} />
        </div>
      </div>
      <PrimaryNav
        categories={props.categories}
        activeSlug={props.search.categorySlug}
      />
    </header>
  );
}
