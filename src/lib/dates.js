var MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad2(n) {
  return n < 10 ? "0" + n : "" + n;
}

// Pure integer UTC date formatter (Howard Hinnant civil-from-days).
// Deterministic across all timezones, OSes, and JS engines without Intl or Date allocation.
export function formatDateUTC(epochSec, includeTime) {
  var sec = Math.floor(epochSec);
  var days = Math.floor(sec / 86400);
  var remSec = sec - days * 86400;
  if (remSec < 0) {
    days -= 1;
    remSec += 86400;
  }
  var z = days + 719468;
  var era = Math.floor((z >= 0 ? z : z - 146096) / 146097);
  var doe = z - era * 146097;
  var yoe = Math.floor(
    (doe -
      Math.floor(doe / 1460) +
      Math.floor(doe / 36524) -
      Math.floor(doe / 146096)) /
      365
  );
  var y = yoe + era * 400;
  var doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  var mp = Math.floor((5 * doy + 2) / 153);
  var d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  var m = mp < 10 ? mp + 3 : mp - 9;
  if (m <= 2) {
    y += 1;
  }
  var base = MONTH_NAMES[m - 1] + " " + pad2(d) + ", " + y;
  if (!includeTime) {
    return base;
  }
  var hh = Math.floor(remSec / 3600);
  var mm = Math.floor((remSec - hh * 3600) / 60);
  return base + " " + pad2(hh) + ":" + pad2(mm) + " UTC";
}
