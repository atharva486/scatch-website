import { Link, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/seller/addproduct', label: 'Add Products', icon: '➕' },
  { to: '/seller/business_dashboard', label: 'Analytics', icon: '📈' },
  { to: '/seller/profile', label: 'Profile', icon: '👤' },
];

/**
 * Collapsible side navigation for the seller portal.
 *
 * Same shape as the customer sidebar with the sage highlight, so the seller
 * portal reads as the same product. "Account Settings" was an `<a href>`,
 * causing a full page reload, and the active item's `border-l-4` shifted the
 * other labels; both fixed here.
 */
function SidemenuSeller({ sidebar }) {
  const location = useLocation();

  return (
    <nav
      aria-label="Seller navigation"
      aria-hidden={!sidebar}
      className={`min-h-screen shrink-0 overflow-hidden border-r border-primary-800 bg-primary-900
                  shadow-xl transition-all duration-500 ease-in-out ${sidebar ? 'w-48' : 'w-0'}`}
    >
      {sidebar && (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-primary-800 px-4 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sage-500 to-sage-600">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white">Scatch</p>
              <p className="text-xs text-sage-300">Seller Portal</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-6">
            {LINKS.map(({ to, label, icon }) => {
              const isActive = location.pathname === to;

              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-xl border-l-4 px-3 py-3 text-sm font-medium
                              transition-all duration-200 ${
                                isActive
                                  ? 'border-sage-500 bg-sage-600/20 text-sage-300'
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
              <p className="text-xs uppercase tracking-wider text-primary-500">Manage your store</p>
              <Link
                to="/seller/profile"
                className="text-xs text-sage-300 underline-offset-2 transition-colors duration-150 hover:text-sage-200 hover:underline"
              >
                Account settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default SidemenuSeller;