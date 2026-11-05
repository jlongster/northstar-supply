import { groupDigits } from "./numbers.js";

// Formats an amount with the locale's symbol, decimals and separators (no Intl, so the output is
// identical on every runtime).
export function formatMoney(amount, locale) {
  var decimals = locale && typeof locale.decimals === "number" ? locale.decimals : 2;
  var symbol = locale && locale.symbol ? locale.symbol : "$";
  var groupSep = locale && locale.groupSep !== undefined ? locale.groupSep : ",";
  var decSep = locale && locale.decSep !== undefined ? locale.decSep : ".";
  var neg = amount < 0;
  var abs = Math.abs(amount);
  var fixed = abs.toFixed(decimals);
  var parts = fixed.split(".");
  var whole = groupDigits(parts[0], groupSep);
  var formatted =
    decimals > 0 ? symbol + whole + decSep + parts[1] : symbol + whole;
  return neg && abs > 0 ? "-" + formatted : formatted;
}
