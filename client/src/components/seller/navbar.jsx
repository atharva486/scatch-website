/**
 * Top bar for the seller portal.
 *
 * `f === 1` renders the search box; `f === 0` hides it.
 *
 * Fixed to match the customer navbar: the toggle is a labelled `type="button"`
 * that reports the sidebar state via `aria-expanded`, and the search input has
 * an accessible name.
 */
function Navbar({ change, logout, f, name_search, sidebar }) {
  return (
    <header className="w-full h-20 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-between px-6 shadow-md">
      <button
        type="button"
        onClick={change}
        aria-label="Toggle navigation menu"
        aria-expanded={Boolean(sidebar)}
        className="text-white text-base font-medium hover:text-green-300 transition"
      >
        ☰ Side Bar
      </button>

      <div className="text-white text-3xl font-bold tracking-wide">Scatch Seller</div>

      {f === 1 && (
        <input
          type="text"
          aria-label="Search products"
          placeholder="🔍 Search"
          onChange={(event) => name_search(event)}
          className="bg-gray-200 text-gray-800 placeholder-gray-600 rounded-full px-5 py-2 w-80 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      )}

      <button
        type="button"
        onClick={logout}
        className="text-white text-base font-medium hover:text-red-300 transition"
      >
        Logout
      </button>
    </header>
  );
}

export default Navbar;
