import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { cx } from "../../lib/classNames.js";
import { formatMoney } from "../../lib/money.js";

// promo.html is trusted, server-authored markup (the app's only dangerouslySetInnerHTML).
export function AnnouncementBanner(props) {
  var locale = React.useContext(LocaleContext);
  var promo = props.promo;
  if (!promo) {
    return null;
  }
  return (
    <section
      className={cx("ns-promo", { "ns-promo-urgent": Boolean(promo.urgent) })}
      hidden={!promo.active}
      data-campaign={promo.code}
    >
      <p className="ns-promo-inner ns-container">
        <span
          className="ns-promo-html"
          dangerouslySetInnerHTML={{ __html: promo.html }}
        />
        {promo.minOrder !== undefined && promo.minOrder > 0 ? (
          <span className="ns-promo-min">
            Min. order {formatMoney(promo.minOrder, locale)}
          </span>
        ) : null}
        {promo.code ? (
          <span className="ns-promo-code">
            Code <code>{promo.code}</code>
          </span>
        ) : null}
      </p>
    </section>
  );
}
