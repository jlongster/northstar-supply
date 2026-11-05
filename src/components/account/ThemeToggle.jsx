import React from "react";
import { NavContext } from "../../context/NavContext.js";
import { ThemeContext } from "../../context/ThemeContext.js";
import { Icon } from "../ui/Icon.jsx";

// Light/dark switch: posts the other theme to the server, which stores it in a cookie and
// redirects back to the current page.
export function ThemeToggle() {
  var nav = React.useContext(NavContext);
  var theme = React.useContext(ThemeContext);
  var next = theme === "dark" ? "light" : "dark";
  return (
    <form className="ns-theme-toggle" method="post" action={nav.base + "/theme"}>
      <input type="hidden" name="theme" value={next} />
      <input type="hidden" name="back" value={nav.current} />
      <button
        type="submit"
        className="ns-icon-btn"
        aria-label={"Switch to " + next + " theme"}
        title={"Switch to " + next + " theme"}
      >
        {theme === "dark" ? <Icon name="sun" /> : <Icon name="moon" />}
      </button>
    </form>
  );
}
