import { ADDRESS_FIELDS } from '../../utils/address';

/**
 * Grid span per field, written out in full.
 *
 * A `col-span-${field.span}` template would produce nothing at all: Tailwind
 * scans source text for whole class names and cannot evaluate interpolation.
 * Every literal has to appear in the file, so they live here.
 */
const SPAN_CLASS = {
  2: 'sm:col-span-2',
  3: 'sm:col-span-3',
  6: 'sm:col-span-6',
};

/**
 * The delivery-address block on the checkout form.
 *
 * Replaces a single free-text `<textarea>`. That could only ever be validated as
 * "is it empty", and because a textarea carries no `autocomplete` token the
 * browser could not fill it in -- so every order meant retyping the same address.
 * These are separate inputs with the standard autofill tokens, which is what
 * lets a buyer select a saved address.
 *
 * Layout is a 6-column grid so the locality fields sit three-up on a desktop
 * and stack to a single column on a phone.
 *
 * Errors are reported per field, tied to the input with `aria-invalid` and
 * `aria-describedby`, so a screen reader announces the problem with the input
 * rather than leaving it to a toast at the bottom of the page.
 */
export default function AddressFields({ value, errors = {}, onChange, onBlur, idPrefix = 'ship' }) {
  return (
    <fieldset className="min-w-0">
      <legend className="section-label">Delivery address</legend>
      <p className="field-hint mt-1">
        Your browser can fill these in from a saved address.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
        {ADDRESS_FIELDS.map((field) => {
          const id = `${idPrefix}-${field.name}`;
          const errorId = `${id}-error`;
          const error = errors[field.name];
          const raw = value?.[field.name] ?? '';

          return (
            <div key={field.name} className={`min-w-0 ${SPAN_CLASS[field.span] ?? ''}`}>
              <label className="field-label" htmlFor={id}>
                {field.label}
                {field.required ? (
                  <span className="ml-0.5 text-red-600" aria-hidden="true">
                    *
                  </span>
                ) : (
                  <span className="ml-1 font-normal normal-case tracking-normal text-primary-500">
                    optional
                  </span>
                )}
              </label>

              <input
                id={id}
                name={field.name}
                type={field.type ?? 'text'}
                value={raw}
                onChange={(event) => onChange(field.name, event.target.value)}
                onBlur={() => onBlur(field.name)}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                autoCapitalize={field.autoCapitalize}
                spellCheck={false}
                aria-required={field.required || undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                maxLength={field.max}
                className={`field-input ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
              />

              {error && (
                <p id={errorId} className="mt-1.5 text-xs font-semibold text-red-600">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}