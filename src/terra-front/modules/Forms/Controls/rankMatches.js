export const MAX_RENDERED_ITEMS = 200;

/**
 * Keep the values matching the query, the ones starting with it first, and cap
 * the list so the popover stays responsive on large value sets.
 */
const rankMatches = (items, query, max = MAX_RENDERED_ITEMS) => {
  const search = query.toLowerCase();
  if (!search) return items.slice(0, max);

  return items
    .filter(({ label }) => label.toLowerCase().includes(search))
    .sort((a, b) => {
      const byPrefix = Number(b.label.toLowerCase().startsWith(search))
        - Number(a.label.toLowerCase().startsWith(search));
      return byPrefix || a.label.localeCompare(b.label);
    })
    .slice(0, max);
};

export default rankMatches;
