/**
 * Top bar for the seller portal.
 *
 * `f === 1` renders the search box; `f === 0` hides it.
 *
 * Uses the new mature theme matching the customer portal.
 */
function Navbar({ change, logout, f, name_search, sidebar }) {
  return (
    <header className="w-full h-20 bg-primary-900 flex items-center justify-between px-6 shadow-lg border-b border-primary-800">
      <button
        type="button"
        onClick={change}
        aria-label="Toggle navigation menu"
        aria-expanded={Boolean(sidebar)}
        className="text-surface-100 text-base font-medium hover:text-accent-300 transition-colors duration-200"
      >
        ☰ Menu
      </button>

      <div className="text-white text-2xl font-bold tracking-wide flex items-center gap-2">
        <span className="text-sage-400">◆</span>
        Scatch Seller
      </div>

      {f === 1 && (
        <input
          type="text"
          aria-label="Search products"
          placeholder="Search products…"
          onChange={(event) => name_search(event)}
          className="w-72 md:w-80 px-4 py-2.5 rounded-xl bg-primary-800 border border-primary-700
                       text-white placeholder-primary-400
                       focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent
                       transition-all duration-200"
        />
      )}

      <button
        type="button"
        onClick={logout}
        className="text-surface-100 text-base font-medium hover:text-accent-300 transition-colors duration-200
                     px-3 py-1.5 rounded-lg hover:bg-primary-800"
      >
        Logout
      </button>
    </header>
  );
}

export default Navbar;