import React from "react";

// Where the app lives: `base` prefixes every link and form action (e.g. "/northstar/react"),
// `assets` prefixes static files (e.g. "/northstar"), `current` is the current path + query
// relative to `base` (forms send it back so the server can redirect to the same page).
export var NavContext = React.createContext({
  base: "",
  assets: "",
  view: "home",
  path: "/",
  current: "/",
});
