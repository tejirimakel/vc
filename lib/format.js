const DEFAULT_DATE_OPTIONS = { month: 'short', day: 'numeric' };

// Format an ISO date string with Intl, returning `fallback` for missing/invalid input.
export function formatDate(value, options = DEFAULT_DATE_OPTIONS, fallback = 'Latest') {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-US', options).format(date);
}
