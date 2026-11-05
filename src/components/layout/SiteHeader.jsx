import React from "react";
import { UserMenu } from "../account/UserMenu.jsx";
import { SearchBox } from "../search/SearchBox.jsx";
import { PrimaryNav } from "./PrimaryNav.jsx";

export function SiteHeader(props) {
  return (
    <header className="ns-header">
      <div className="ns-header-top">
        <a href="/" className="ns-brand" data-brand="northstar">
          Northstar Supply
        </a>
        <SearchBox search={props.search} />
        <UserMenu />
      </div>
      <PrimaryNav
        categories={props.categories}
        activeSlug={props.search.categorySlug}
      />
    </header>
  );
}
