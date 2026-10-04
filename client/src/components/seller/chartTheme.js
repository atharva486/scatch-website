/**
 * Shared Recharts styling.
 *
 * The four seller charts each hardcoded their own indigo fill (`#4f46e5`,
 * `#6366f1`) and grey tick colour (`#4b5563`, `#555`, `#f0f0f0`), so the
 * analytics page read as a different product from the rest of the seller
 * portal. Recharts needs real colour values rather than class names, so these
 * mirror the `@theme` ramps in `index.css`.
 *
 * Every hex in the client lives in this file or in `utils/image.js`, both of
 * which need literal colours and therefore cannot use Tailwind class names.
 * Each value is annotated with the token it corresponds to.
 */
export const AXIS_TICK = { fill: '#64748b', fontSize: 12 }; // primary-500
export const GRID_STROKE = '#e2e8f0'; // primary-200
export const CURSOR_FILL = '#f1f5f9'; // primary-100

export const SERIES = {
  primary: '#334155', // primary-700
  accent: '#b45309', // accent-700
  sage: '#4f734f', // sage-600
  danger: '#dc2626', // red-600
};

export const TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '0.75rem',
  fontSize: '0.8125rem',
  boxShadow: '0 4px 12px rgb(15 23 42 / 0.08)',
};

/**
 * Bar entrance animation is off, and it must stay off.
 *
 * Recharts 3.1.0 grows bars through an animation driven by
 * `requestAnimationFrame`. `RenderRectangles` commits its interpolated geometry
 * only once that animation reports progress — the `if (t > 0)` branch in
 * `node_modules/recharts/es6/cartesian/Bar.js` — and on every render before
 * that it re-enters the animated branch. If the animation never ticks, `t`
 * stays 0, nothing is ever committed, and each bar renders as an empty
 * `<g class="recharts-bar-rectangle">`: axes, gridlines and labels all draw,
 * the data does not.
 *
 * `requestAnimationFrame` is throttled or paused whenever the page is not
 * visibly animating — a background tab, a hidden window, a throttled renderer.
 * So this is not only a headless-test artefact: a seller who opened the
 * analytics page in a background tab and then switched to it could be shown
 * permanently blank charts.
 *
 * These charts report the seller's actual sales, so a visible bar matters more
 * than the entrance flourish. Exported as one constant so the four charts
 * cannot drift apart, and set to `false` deliberately — do not "restore" it.
 */
export const ANIMATE_BARS = false;