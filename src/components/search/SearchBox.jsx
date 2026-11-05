import React from "react";
import { ActionButton } from "../ui/ActionButton.jsx";

export function SearchBox(props) {
  var search = props.search;
  var inputId = React.useId();
  var hasQuery = Boolean(search.query && search.query.length > 0);
  var submitExtra = {
    "data-action": "catalog-search",
    "aria-label": "Run catalog search",
  };
  return (
    <form className="ns-search" role="search" action="/catalog" method="get">
      <label className="ns-sr-only" htmlFor={inputId}>
        Search hardware
      </label>
      <input
        type="search"
        id={inputId}
        name="q"
        defaultValue={search.query}
        placeholder="Search SKU, tool, or spec..."
        disabled={Boolean(search.disabled)}
        readOnly={Boolean(search.readOnly)}
        required={Boolean(search.required)}
        autoComplete="off"
        data-has-query={hasQuery}
      />
      <ActionButton
        type="submit"
        variant="secondary"
        size="sm"
        disabled={Boolean(search.disabled)}
        extraAttrs={submitExtra}
      >
        Search
      </ActionButton>
    </form>
  );
}
