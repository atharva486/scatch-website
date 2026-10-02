import { Link } from 'react-router-dom';

const LINKS = [
  { to: '/seller/dashboard', label: 'Dashboard' },
  { to: '/seller/addproduct', label: 'Add Products' },
  { to: '/seller/business_dashboard', label: 'Analytics' },
  { to: '/seller/profile', label: 'Profile' },
];

/**
 * Collapsible side navigation for the seller portal.
 *
 * Same fix as the customer menu: links were rendered even while the panel was
 * collapsed to `w-0`, leaving invisible links in the tab order.
 */
function SidemenuSeller({ sidebar }) {
  return (
    <nav
      aria-label="Seller"
      aria-hidden={!sidebar}
      className={`transition-all duration-500 ease-in-out min-h-screen shrink-0 overflow-hidden shadow-md ${
        sidebar ? 'w-40' : 'w-0'
      } bg-gradient-to-b from-blue-600 to-blue-800`}
    >
      {sidebar && (
        <div className="flex flex-col pl-3 py-20 gap-6 text-white text-sm font-medium whitespace-nowrap">
          {LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-xl hover:text-green-300 hover:translate-x-2 transition-all duration-200"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default SidemenuSeller;
