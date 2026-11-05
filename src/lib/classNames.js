// cx("a", cond && "b", { c: true, d: false }) -> "a b c"
export function cx() {
  var classes = "";
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (!arg) continue;
    if (typeof arg === "string") {
      classes = classes ? classes + " " + arg : arg;
    } else if (typeof arg === "object") {
      var keys = Object.keys(arg);
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        if (arg[key]) {
          classes = classes ? classes + " " + key : key;
        }
      }
    }
  }
  return classes;
}
