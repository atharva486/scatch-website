// Aliased to a capitalised name (framer-motion's own recommendation): this
// ESLint config's `no-unused-vars` ignore pattern only covers names starting
// with an upper-case letter, and JSX member expressions are not counted as
// variable references by that rule.
import { AnimatePresence, motion as Motion } from 'framer-motion';

/**
 * Transient notification.
 *
 * The className used to be a template literal but was assigned with double
 * quotes, so the `${...}` interpolation was emitted as literal text and the
 * toast rendered with the wrong (and unstyled) colour every time. Both success
 * and error now resolve through a real template literal.
 */
function Flashpopup({ type, message, visible }) {
  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      {visible && (
        <Motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          role="status"
          aria-live="polite"
          className={`fixed top-5 right-5 z-50 max-w-sm px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
            isSuccess ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {message}
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

export default Flashpopup;