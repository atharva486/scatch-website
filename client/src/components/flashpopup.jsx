// Aliased to a capitalised name (framer-motion's own recommendation): this
// ESLint config's `no-unused-vars` ignore pattern only covers names starting
// with an upper-case letter, and JSX member expressions are not counted as
// variable references by that rule.
import { AnimatePresence, motion as Motion } from 'framer-motion';

/**
 * Transient notification.
 *
 * Uses the new mature theme colors for success/error toast.
 */
function Flashpopup({ type, message, visible }) {
  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      {visible && (
        <Motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          role="status"
          aria-live="polite"
          className={`fixed top-5 right-5 z-50 max-w-sm px-5 py-4 rounded-xl shadow-lg text-white text-sm font-medium
            ${isSuccess
              ? 'bg-sage-600 hover:bg-sage-700'
              : 'bg-red-600 hover:bg-red-700'}`}
        >
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 mt-0.5" aria-hidden="true">
              {isSuccess ? '✓' : '✕'}
            </span>
            <p className="leading-relaxed">{message}</p>
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

export default Flashpopup;