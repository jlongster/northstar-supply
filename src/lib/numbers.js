export function groupDigits(intStr, sep) {
  if (!sep || intStr.length <= 3) {
    return intStr;
  }
  var out = "";
  var count = 0;
  for (var i = intStr.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      out = sep + out;
    }
    out = intStr.charAt(i) + out;
    count++;
  }
  return out;
}

export function formatInt(n, groupSep) {
  var neg = n < 0;
  var abs = Math.floor(Math.abs(n) + 0.5);
  var grouped = groupDigits("" + abs, groupSep === undefined ? "," : groupSep);
  return neg ? "-" + grouped : grouped;
}
