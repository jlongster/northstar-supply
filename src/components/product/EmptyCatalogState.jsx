import React from "react";
import { ActionButton } from "../ui/ActionButton.jsx";

export function EmptyCatalogState(props) {
  var resetExtra = { "data-action": "reset-filters" };
  return (
    <div className="ns-empty" role="status" data-query={props.query}>
      <h3 className="ns-empty-title">No matching products found</h3>
      <p className="ns-empty-desc">
        {props.query
          ? 'No hardware matched "' + props.query + '". Try clearing filters.'
          : "This category currently has 0 items available."}
      </p>
      <ActionButton variant="secondary" extraAttrs={resetExtra}>
        Reset Filters
      </ActionButton>
    </div>
  );
}
