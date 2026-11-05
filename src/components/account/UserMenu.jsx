import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { UserContext } from "../../context/UserContext.js";
import { AvatarBadge } from "../ui/AvatarBadge.jsx";
import { Icon } from "../ui/Icon.jsx";
import { LoyaltyBadge } from "./LoyaltyBadge.jsx";

// Account link: "Sign in" for anonymous visitors, avatar + name + tier when signed in.
export function UserMenu() {
  var nav = React.useContext(NavContext);
  var user = React.useContext(UserContext);
  if (!user) {
    return (
      <div className="ns-user ns-user-anon" data-authenticated={false}>
        <a href={nav.base + "/signin"} className="ns-header-link">
          <Icon name="user" />
          <span className="ns-header-link-label">Sign in</span>
        </a>
      </div>
    );
  }
  return (
    <div
      className="ns-user ns-user-auth"
      data-authenticated={true}
      data-user-id={user.id}
    >
      <a href={nav.base + "/signin"} className="ns-header-link" title={"Account: " + user.name}>
        <AvatarBadge name={user.name} color={user.avatarColor} />
        <span className="ns-header-link-label ns-greeting">{user.name}</span>
        <LoyaltyBadge tier={user.tier} points={user.points} />
      </a>
    </div>
  );
}
