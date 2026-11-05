import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { formatMoney } from "../../lib/money.js";

export function PriceBlock(props) {
  var locale = React.useContext(LocaleContext);
  var price = props.price;
  var orig = props.originalPrice;
  var hasDiscount = typeof orig === "number" && orig > price && orig > 0;
  var pctOff = hasDiscount
    ? Math.round(((orig - price) / orig) * 100)
    : 0;
  return (
    <div className="ns-price-block" data-on-sale={hasDiscount}>
      <span className="ns-price-current">{formatMoney(price, locale)}</span>
      {hasDiscount ? (
        <>
          <del className="ns-price-orig">{formatMoney(orig, locale)}</del>
          <span className="ns-price-save">Save {pctOff}%</span>
        </>
      ) : null}
      {typeof props.rebateAmount === "number" && props.rebateAmount !== 0 ? (
        <span className="ns-price-rebate">
          Rebate: {formatMoney(props.rebateAmount, locale)}
        </span>
      ) : null}
    </div>
  );
}
