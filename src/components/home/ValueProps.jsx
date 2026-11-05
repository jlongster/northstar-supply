import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { formatMoney } from "../../lib/money.js";
import { Icon } from "../ui/Icon.jsx";

export function ValueProps(props) {
  var locale = React.useContext(LocaleContext);
  return (
    <ul className="ns-values">
      <li>
        <Icon name="truck" size={22} />
        <strong>Free shipping over {formatMoney(props.freeShippingThreshold, locale)}</strong>
        <span>Same-day dispatch on orders placed by 3 pm.</span>
      </li>
      <li>
        <Icon name="doc" size={22} />
        <strong>Net-30 trade accounts</strong>
        <span>Invoice billing and tax-exempt purchasing.</span>
      </li>
      <li>
        <Icon name="shield" size={22} />
        <strong>2-year warranty</strong>
        <span>Lifetime coverage on hand tools.</span>
      </li>
      <li>
        <Icon name="clock" size={22} />
        <strong>Calibration certificates</strong>
        <span>Included with every measuring instrument.</span>
      </li>
    </ul>
  );
}
