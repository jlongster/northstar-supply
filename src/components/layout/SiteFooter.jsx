import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { ThemeContext } from "../../context/ThemeContext.js";
import { formatDateUTC } from "../../lib/dates.js";

export function SiteFooter(props) {
  var theme = React.useContext(ThemeContext);
  var locale = React.useContext(LocaleContext);
  return (
    <footer className="ns-footer">
      <p className="ns-footer-copy">
        © Northstar Industrial Supply · Generated{" "}
        <time>{formatDateUTC(props.timestampSec, true)}</time>
      </p>
      <p className="ns-footer-meta">
        <>
          <span>Locale: {locale.code}</span>
          {" · "}
          <span>Currency: {locale.currency}</span>
          {" · "}
          <span>Theme: {theme}</span>
        </>
      </p>
    </footer>
  );
}
