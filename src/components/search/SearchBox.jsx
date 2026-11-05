import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { Icon } from "../ui/Icon.jsx";

export function SearchBox(props) {
  var nav = React.useContext(NavContext);
  var search = props.search;
  var inputId = React.useId();
  var hasQuery = Boolean(search.query && search.query.length > 0);
  return (
    <form className="ns-search" role="search" action={nav.base + "/search"} method="get">
      <label className="ns-sr-only" htmlFor={inputId}>
        Search products
      </label>
      <Icon name="search" size={18} />
      <input
        type="search"
        id={inputId}
        name="q"
        defaultValue={search.query}
        placeholder="Search tools, brands or SKUs"
        disabled={Boolean(search.disabled)}
        readOnly={Boolean(search.readOnly)}
        required={Boolean(search.required)}
        autoComplete="off"
        data-has-query={hasQuery}
      />
      <button
        type="submit"
        className="ns-search-submit"
        disabled={Boolean(search.disabled)}
        data-action="catalog-search"
      >
        Search
      </button>
    </form>
  );
}
