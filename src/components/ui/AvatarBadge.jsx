import React from "react";
import { computeInitials } from "../../lib/text.js";

export function AvatarBadge(props) {
  var bg = props.color || "#0369a1";
  return (
    <span
      className="ns-avatar"
      aria-hidden="true"
      style={{
        backgroundColor: bg,
        color: "#ffffff",
        width: 28,
        height: 28,
        lineHeight: "28px",
        fontWeight: 700,
      }}
    >
      {computeInitials(props.name)}
    </span>
  );
}
