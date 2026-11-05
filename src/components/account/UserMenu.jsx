import React from "react";
import { UserContext } from "../../context/UserContext.js";
import { AvatarBadge } from "../ui/AvatarBadge.jsx";
import { LoyaltyBadge } from "./LoyaltyBadge.jsx";

// Signed-in summary, or sign-in links for anonymous visitors.
export function UserMenu() {
  var user = React.useContext(UserContext);
  if (!user) {
    return (
      <div className="ns-user ns-user-anon" data-authenticated={false}>
        <a href="/signin" className="ns-link">
          Sign in
        </a>
        <a href="/register" className="ns-link ns-link-cta">
          Trade Account
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
      <>
        <AvatarBadge name={user.name} color={user.avatarColor} />
        <span className="ns-greeting">Hi, {user.name}</span>
        <LoyaltyBadge tier={user.tier} points={user.points} />
        {user.savedCount > 0 ? (
          <a href="/saved" className="ns-saved-link">
            Saved ({user.savedCount})
          </a>
        ) : null}
      </>
    </div>
  );
}
