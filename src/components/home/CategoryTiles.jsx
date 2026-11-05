import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { NavContext } from "../../context/NavContext.js";
import { formatInt } from "../../lib/numbers.js";
import { ProductArt } from "../product/ProductArt.jsx";

export function CategoryTiles(props) {
  var nav = React.useContext(NavContext);
  var locale = React.useContext(LocaleContext);
  return (
    <ul className="ns-tiles">
      {props.categories.map(function (cat) {
        return (
          <li key={cat.id} className="ns-tile">
            <a href={nav.base + "/c/" + cat.slug}>
              <ProductArt category={cat.slug} size="tile" />
              <span className="ns-tile-label">{cat.label}</span>
              <span className="ns-tile-count">
                {formatInt(cat.count, locale.groupSep)} products
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
