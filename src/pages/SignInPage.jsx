import React from "react";
import { NavContext } from "../context/NavContext.js";
import { UserContext } from "../context/UserContext.js";
import { LoyaltyBadge } from "../components/account/LoyaltyBadge.jsx";
import { AvatarBadge } from "../components/ui/AvatarBadge.jsx";

// A stub: signing in sets a cookie for a sample trade account (no password is checked).
export function SignInPage() {
  var nav = React.useContext(NavContext);
  var user = React.useContext(UserContext);
  var emailId = React.useId();
  var passwordId = React.useId();
  if (user) {
    return (
      <div className="ns-auth ns-container">
        <section className="ns-auth-card">
          <div className="ns-account">
            <AvatarBadge name={user.name} color={user.avatarColor} />
            <div>
              <h1 className="ns-auth-title">{user.name}</h1>
              <p className="ns-auth-sub">
                Trade account <LoyaltyBadge tier={user.tier} points={user.points} />
              </p>
            </div>
          </div>
          <p className="ns-auth-note">
            Your tier discount is applied to the cart automatically.
          </p>
          <form method="post" action={nav.base + "/signout"}>
            <button type="submit" className="ns-btn ns-btn-secondary ns-btn-block">
              Sign out
            </button>
          </form>
        </section>
      </div>
    );
  }
  return (
    <div className="ns-auth ns-container">
      <section className="ns-auth-card">
        <h1 className="ns-auth-title">Sign in</h1>
        <p className="ns-auth-sub">Use your trade account for team pricing and Net-30 terms.</p>
        <form className="ns-auth-form" method="post" action={nav.base + "/signin"}>
          <input type="hidden" name="back" value="/" />
          <label htmlFor={emailId}>Work email</label>
          <input
            id={emailId}
            type="email"
            name="email"
            autoComplete="username"
            defaultValue="maya@linfabrication.com"
          />
          <label htmlFor={passwordId}>Password</label>
          <input
            id={passwordId}
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Any password works in the demo"
          />
          <button type="submit" className="ns-btn ns-btn-primary ns-btn-lg ns-btn-block">
            Sign in
          </button>
        </form>
        <p className="ns-auth-note">
          Demo store: signing in uses a sample trade account, and no password is checked.
        </p>
      </section>
    </div>
  );
}
