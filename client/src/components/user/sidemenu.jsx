import { Link, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/user/homepage', label: 'Home', icon: '🏠' },
  { to: '/user/orders', label: 'Orders', icon: '📦' },
  { to: '/user/wishlist', label: 'Wishlist', icon: '♡' },
  { to: '/user/profile', label: 'Profile', icon: '👤' },
];

/**
 * Collapsible side navigation.
 *
 * Deep slate with warm accents; the active link is the copper highlight.
 *
 * Three fixes over the previous version:
 *  - "Contact Support" was an `<a href>`, so following it did a full page
 *    reload and threw away the SPA; it is a `<Link>` to the profile page.
 *  - that link used `text-accent-600` on `bg-primary-900`, which is dark brown
 *    on dark navy and effectively unreadable; the sidebar highlights are
 *    `accent-300`/`accent-400` elsewhere, so it matches.
 *  - only the active link carried `border-l-4`, which shoved its label 4px
 *    sideways on every navigation. The border is now on both states.
 */
function Sidemenu({ sidebar }) {
  const location = useLocation();

  return (
    <nav
      aria-label="Main navigation"
      aria-hidden={!sidebar}
      className={`min-h-screen shrink-0 overflow-hidden border-r border-primary-800 bg-primary-900
                  shadow-xl transition-all duration-500 ease-in-out ${sidebar ? 'w-48' : 'w-0'}`}
    >
      {sidebar && (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-primary-800 px-4 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white">Scatch</p>
              <p className="text-xs text-primary-400">Customer Portal</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-6">
            {LINKS.map(({ to, label, icon }) => {
              const isActive = location.pathname === to;

              return (
                <Link
                  key={to}
                  to={to}
                  // `border-l-4 border-transparent` on both states keeps the
                  // label from jumping when the active item changes.
                  className={`flex items-center gap-3 rounded-xl border-l-4 px-3 py-3 text-sm font-medium
                              transition-all duration-200 ${
                                isActive
                                  ? 'border-accent-500 bg-accent-600/20 text-accent-300'
                                  : 'border-transparent text-primary-300 hover:bg-primary-800 hover:text-white'
                              }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-lg" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              );
            })}

            <div className="my-2 h-px bg-primary-800" />

            <div className="px-3 py-2 text-center">
              <p className="text-xs uppercase tracking-wider text-primary-500">Need help?</p>
              <Link
                to="/user/profile"
                className="text-xs text-accent-400 underline-offset-2 transition-colors duration-150 hover:text-accent-300 hover:underline"
              >
                Update your profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Sidemenu;