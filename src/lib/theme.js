export function getThemePalette(theme) {
  if (theme === "dark") {
    return {
      bg: "#0f172a",
      fg: "#f8fafc",
      accent: "#38bdf8",
    };
  }
  if (theme === "contrast") {
    return {
      bg: "#000000",
      fg: "#ffffff",
      accent: "#facc15",
    };
  }
  return {
    bg: "#f8fafc",
    fg: "#0f172a",
    accent: "#0284c7",
  };
}
