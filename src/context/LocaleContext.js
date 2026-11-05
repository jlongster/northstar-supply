import React from "react";

export var LocaleContext = React.createContext({
  code: "en-US",
  currency: "USD",
  symbol: "$",
  decimals: 2,
  groupSep: ",",
  decSep: ".",
});
