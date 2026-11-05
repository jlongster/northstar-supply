import React from "react";
import { LocaleContext } from "./context/LocaleContext.js";
import { NavContext } from "./context/NavContext.js";
import { ThemeContext } from "./context/ThemeContext.js";
import { UserContext } from "./context/UserContext.js";
import { StorePage } from "./pages/StorePage.jsx";

// Root component. `data` is the whole request: theme, locale, user, nav (base path, view, current
// URL), search state, categories, cart, and the view's own data (home, listing or product). See
// store/page.js for how the live server builds it and src/data.js for the benchmark generator.
export default function App(props) {
  var data = props.data;
  return (
    <ThemeContext.Provider value={data.theme}>
      <LocaleContext.Provider value={data.locale}>
        <UserContext.Provider value={data.user}>
          <NavContext.Provider value={data.nav}>
            <StorePage data={data} />
          </NavContext.Provider>
        </UserContext.Provider>
      </LocaleContext.Provider>
    </ThemeContext.Provider>
  );
}
