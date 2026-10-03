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
 * Uses the new mature theme with sage accent for seller portal.
 */
function SidemenuSeller({ sidebar }) {
  const location = useLocation();

  return (
    <nav
      aria-label="Seller navigation"
      aria-hidden={!sidebar}
      className={`transition-all duration-500 ease-in-out min-h-screen shrink-0 overflow-hidden shadow-xl ${
        sidebar ? 'w-48' : 'w-0'
      } bg-primary-900 border-r border-primary-800`}
    >
      {sidebar && (
        <div className="flex flex-col h-full">
          {/* Brand area at top */}
          <div className="flex items-center gap-3 px-4 py-6 border-b border-primary-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-500 to-sage-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg">Scatch</p>
              <p className="text-sage-300 text-xs">Seller Portal</p>
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex-1 flex flex-col px-3 py-6 gap-1 overflow-y-auto">
            {LINKS.map(({ to, label, icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-sage-600/20 text-sage-300 border-l-4 border-sage-500'
                      : 'text-primary-300 hover:bg-primary-800 hover:text-white'}
                  `}
                >
                  <span className="text-lg" aria-hidden="true">{icon}</span>
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="h-px bg-primary-800 my-2" />

            {/* Footer info */}
            <div className="px-3 py-2 text-center">
              <p className="text-primary-500 text-xs uppercase tracking-wider">
                Manage your store
              </p>
              <a href="/seller/profile" className="text-accent-600 hover:text-accent-700 underline-offset-2 hover:underline transition-colors duration-150 text-xs">
                Account Settings
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default SidemenuSeller;