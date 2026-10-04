/**
 * Shared shell for the four login/register screens.
 *
 * They were four near-identical copies of a `w-1/2` column on a `sky-500`
 * gradient, which is why they drifted apart and why none of them matched the
 * rest of the site. This component owns the layout, the brand panel and the
 * cross-links, and each page only supplies its heading and its <form>.
 *
 * Presentation only: no page passes behaviour through here, so the existing
 * validation and submit handlers stay exactly as they were.
 */

const PROOF_POINTS = [
  {
    title: 'Verified sellers',
    body: 'Every trader is GST verified before they can list a part.',
  },
  {
    title: 'Secure checkout',
    body: 'Orders are recorded against your account with a full audit trail.',
  },
  {
    title: 'Genuine parts',
    body: 'OEM and aftermarket stock, listed with real stock counts.',
  },
];

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  tone = 'accent',
}) {
  // Sellers lean on the sage secondary, customers on the copper accent, so the
  // two portals are told apart at a glance without breaking the palette.
  const badge =
    tone === 'sage'
      ? 'bg-sage-500 text-primary-950'
      : 'bg-accent-500 text-primary-950';
  const glow =
    tone === 'sage'
      ? 'bg-sage-500/20'
      : 'bg-accent-500/20';
  const rule = tone === 'sage' ? 'bg-sage-400' : 'bg-accent-400';

  return (
    <div className="min-h-screen w-full bg-surface-100 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel. Decorative, so it is skipped by screen readers and
          collapses away on small screens where the form is the whole point. */}
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden bg-primary-900 px-12 py-14 lg:flex lg:flex-col lg:justify-between"
      >
        <div className={`pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl ${glow}`} />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-primary-700/30 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${badge}`}>
            S
          </span>
          <span className="text-2xl font-semibold tracking-tight text-surface-50">Scatch</span>
        </div>

        <div className="relative max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-400">
            Car parts marketplace
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-surface-50 text-balance">
            Every part your car needs, from sellers you can trust.
          </h2>
          <div className={`mt-6 h-1 w-16 rounded-full ${rule}`} />

          <dl className="mt-10 space-y-6">
            {PROOF_POINTS.map((point) => (
              <div key={point.title} className="flex gap-3.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${rule}`} />
                <div>
                  <dt className="text-sm font-semibold text-surface-100">{point.title}</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-primary-400">{point.body}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <p className="relative text-xs text-primary-500">
          © {new Date().getFullYear()} Scatch. Built for the Indian aftermarket.
        </p>
      </aside>

      {/* Form column */}
      <main className="flex w-full flex-col items-center justify-center px-5 py-10 sm:px-8">
        {/* Wordmark, small screens only. */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold ${badge}`}>
            S
          </span>
          <span className="text-xl font-semibold tracking-tight text-primary-900">Scatch</span>
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-primary-100 bg-white p-7 shadow-xl shadow-primary-900/5 sm:p-9">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-400">
                {eyebrow}
              </p>
            ) : null}

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-900">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm leading-relaxed text-primary-500">{subtitle}</p> : null}

            <div className="mt-7">{children}</div>
          </div>

          {footer ? <div className="mt-6 text-center text-sm text-primary-500">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}