import TopBar from '../TopBar';

/**
 * Seller top bar.
 *
 * Kept as its own module because every page imports this path. `tone="sage"`
 * gives the seller portal its own highlight within the same palette, so the two
 * portals are distinguishable without leaving the theme.
 */
function Navbar({ change, logout, f, name_search, sidebar }) {
  return (
    <TopBar
      change={change}
      logout={logout}
      f={f}
      name_search={name_search}
      sidebar={sidebar}
      title="Scatch Seller"
      tone="sage"
    />
  );
}

export default Navbar;