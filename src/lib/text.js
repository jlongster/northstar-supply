export function computeInitials(name) {
  if (!name) return "?";
  var trimmed = name.trim();
  if (!trimmed) return "?";
  var parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)).toUpperCase();
}
