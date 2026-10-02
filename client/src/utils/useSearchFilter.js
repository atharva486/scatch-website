import { useState } from 'react';

const normalise = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, '');

/**
 * Client-side search over a list.
 *
 * The storefront, dashboard, orders and wishlist pages each had their own copy
 * of this logic, and all four were broken in the same way:
 *   - `useEffect(..., [searchValue])` refetched the whole list from the API on
 *     every keystroke (one request per character);
 *   - the result was then copied into a second state variable by a second
 *     `useEffect` keyed on the data, so the list rendered was always one render
 *     behind the search box;
 *   - the filter read `product.description` / `product.prod.productname`
 *     unguarded, so an item missing that field threw while rendering.
 *
 * Filtering is now derived during render from a stable source array.
 *
 * @param {Array} items
 * @param {(item: any) => Array<string|number|null|undefined>} getFields
 *        the values to match against, per item
 */
export default function useSearchFilter(items, getFields) {
  const [search, setSearch] = useState('');

  const needle = normalise(search);
  const list = Array.isArray(items) ? items : [];

  const filtered = needle
    ? list.filter((item) =>
        getFields(item).some((value) => normalise(value).includes(needle))
      )
    : list;

  return {
    search,
    setSearch,
    // Handed straight to the navbar's `onChange`.
    onSearch: (event) => setSearch(event.target.value),
    filtered,
  };
}
