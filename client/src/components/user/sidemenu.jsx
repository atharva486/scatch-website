import { Link } from 'react-router-dom';

const LINKS = [
  { to: '/user/homepage', label: 'Home Page' },
  { to: '/user/orders', label: 'My Orders' },
  { to: '/user/wishlist', label: 'Wishlist' },
  { to: '/user/profile', label: 'Profile' },
];

/**
 * Collapsible side navigation.
 *
 * The links used to be rendered unconditionally inside a `w-0 overflow-hidden`
 * container. `overflow-hidden` clips them visually, but they stayed in the tab
 * order - so keyboard and screen-reader users could focus invisible links that
 * looked broken when selected. They are only rendered while the panel is open.
 *
 * `aria-hidden` marks the collapsed panel as decorative, and `aria-expanded` on
 * the trigger (set by the navbar) conveys the state.
 */
function Sidemenu({ sidebar }) {
  return (
    <nav
      aria-label="Main"
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
              className="text-xl hover:scale-105 hover:text-green-300 transition-all duration-200"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Sidemenu;
