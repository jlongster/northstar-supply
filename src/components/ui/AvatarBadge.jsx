import React from "react";
import { computeInitials } from "../../lib/text.js";

export function AvatarBadge(props) {
  var bg = props.color || "#3f3f46";
  return (
    <span
      className="ns-avatar"
      aria-hidden="true"
      style={{
        backgroundColor: bg,
        color: "#ffffff",
      }}
    >
      {computeInitials(props.name)}
    </span>
  );
}
