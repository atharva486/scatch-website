import TopBar from '../TopBar';

/**
 * Customer top bar.
 *
 * Kept as its own module because every page imports this path. The shared
 * implementation lives in `../TopBar`; see that file for the prop contract:
 * `{ change, logout, f, name_search, sidebar, title }`, with `f === 1` rendering
 * the search box.
 */
function Navbar({ change, logout, f, name_search, sidebar, title = 'Scatch' }) {
  return <TopBar change={change} logout={logout} f={f} name_search={name_search} sidebar={sidebar} title={title} />;
}

export default Navbar;