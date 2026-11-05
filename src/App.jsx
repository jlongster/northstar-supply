import React from "react";
import { LocaleContext } from "./context/LocaleContext.js";
import { ThemeContext } from "./context/ThemeContext.js";
import { UserContext } from "./context/UserContext.js";
import { computeCatalogStats } from "./lib/catalog.js";
import { CatalogPage } from "./pages/CatalogPage.jsx";

// Root component. `data` is the whole request: theme, locale, user, promo, search state,
// categories, filters, products, cart, ... (see src/data.js).
export default function App(props) {
  var data = props.data;
  var stats = React.useMemo(
    function () {
      return computeCatalogStats(data.products);
    },
    [data.products]
  );

  return (
    <ThemeContext.Provider value={data.theme}>
      <LocaleContext.Provider value={data.locale}>
        <UserContext.Provider value={data.user}>
          <CatalogPage data={data} stats={stats} />
        </UserContext.Provider>
      </LocaleContext.Provider>
    </ThemeContext.Provider>
  );
}
