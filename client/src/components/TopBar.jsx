/**
 * Shared top bar for both portals.
 *
 * The customer and seller bars were byte-for-byte duplicates apart from the
 * wordmark and the highlight colour, which is how the two portals drifted apart.
 * This is the single implementation; the per-portal files are thin wrappers so
 * every page keeps importing the path it already used.
 *
 * `f === 1` renders the search box; `f === 0` hides it.
 *
 * The search box is `order-last w-full` below `md`, so it wraps onto its own row
 * on a phone instead of pushing the wordmark and Logout off-screen — it was a
 * fixed `w-72`, which cannot fit next to anything.
 *
 * Every colour class is written out in full on both branches. Building them by
 * interpolation (`hover:${x}`) makes Tailwind's scanner miss them, so they would
 * silently produce no CSS.
 */
const SAGE_HOVER = 'hover:bg-primary-800 hover:text-sage-300';
const ACCENT_HOVER = 'hover:bg-primary-800 hover:text-accent-300';

function TopBar({ change, logout, f, name_search, sidebar, title = 'Scatch', tone = 'accent' }) {
  const isSage = tone === 'sage';

  return (
    <header className="w-full shrink-0 border-b border-primary-800 bg-primary-900 px-4 py-3 shadow-lg md:h-20 md:px-6 md:py-0">
      <div className="flex h-full flex-wrap items-center justify-between gap-x-4 gap-y-3 md:flex-nowrap">
        <button
          type="button"
          onClick={change}
          aria-label="Toggle navigation menu"
          aria-expanded={Boolean(sidebar)}
          className={`text-sm font-medium text-surface-100 transition-colors duration-200 hover:text-accent-300 md:text-base ${
            isSage ? 'md:hover:text-sage-300' : ''
          }`}
        >
          ☰ Menu
        </button>

        <div className="flex items-center gap-2 text-lg font-bold tracking-tight text-surface-50 md:text-2xl">
          <span className={isSage ? 'text-sage-400' : 'text-accent-400'} aria-hidden="true">
            {isSage ? '◆' : '●'}
          </span>
          {title}
        </div>

        {f === 1 && (
          <input
            type="text"
            aria-label="Search products"
            placeholder="Search products…"
            onChange={(event) => name_search(event)}
            className="order-last w-full rounded-xl border border-primary-700 bg-primary-800 px-4 py-2.5
                       text-sm text-surface-50 placeholder-primary-400 transition
                       focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent-500
                       md:order-none md:w-72"
          />
        )}

        <button
          type="button"
          onClick={logout}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium text-surface-100 transition md:text-base ${
            isSage ? SAGE_HOVER : ACCENT_HOVER
          }`}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default TopBar;