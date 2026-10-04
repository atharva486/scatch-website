import React, { useEffect, useRef, useState } from 'react';
import api from '../axios/api';
import { useFlash } from '../context/FlashContext';

/**
 * Inline profile editor, shared by the customer and seller profile pages.
 *
 * Notes on what was wrong before:
 *  - the new-password input used `type="text"`, showing the password in clear;
 *  - both copies ignored the server's response, so a failed save still reported
 *    "Updated successfully";
 *  - `triggerFlash` was passed in as a prop by one caller and used from context
 *    by the other.
 */
function EditValues({ value: field, originalVal, onClose, getdata, apiBase, allowedFields }) {
  const { triggerFlash } = useFlash();
  const [newVal, setNewVal] = useState(originalVal ?? '');
  const [previousPassword, setPreviousPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const passwordRef = useRef(null);

  const isPassword = field === 'password';

  // Only password edits need the previous-password check.
  useEffect(() => {
    if (!isPassword) setUnlocked(true);
  }, [isPassword]);

  if (allowedFields && !allowedFields.includes(field)) return null;

  const verifyPreviousPassword = async () => {
    if (!previousPassword) {
      triggerFlash('Enter your current password first.', 'error');
      passwordRef.current?.focus();
      return;
    }

    try {
      const res = await api.post(`${apiBase}/check_password`, { prevpass: previousPassword });
      if (res.data.result) {
        setUnlocked(true);
      } else {
        triggerFlash('That is not your current password.', 'error');
      }
    } catch (err) {
      triggerFlash(err.friendlyMessage || 'Could not verify your password.', 'error');
    }
  };

  const save = async () => {
    const nextValue = isPassword ? newVal : newVal.trim();
    if (!nextValue) {
      triggerFlash('Please enter a value first.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post(`${apiBase}/edit/${field}`, { newVal: nextValue });

      if (res.data.success) {
        triggerFlash(`Updated ${field} successfully`, 'success');
        setNewVal('');
        await getdata?.();
        onClose();
      } else {
        triggerFlash(res.data.error || 'Could not save the change.', 'error');
      }
    } catch (err) {
      triggerFlash(err.friendlyMessage || 'Could not save the change.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const label = field === 'fullname' ? 'name' : field;

  return (
    <div
      // `bg-opacity-*` is a Tailwind v3 utility and generates nothing in v4;
      // the slash syntax is what actually applies here.
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/50 px-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={isPassword ? 'Change password' : `Update ${label}`}
    >
      <div className="w-full max-w-sm rounded-2xl border border-primary-100 bg-white p-6 shadow-xl">
        {isPassword && !unlocked ? (
          <>
            <h3 className="text-lg font-semibold text-primary-900">Confirm your current password</h3>
            <p className="mt-1 text-sm text-primary-500">
              Enter it once to unlock the password change.
            </p>

            <label className="field-label mt-5" htmlFor="current-password">
              Current password
            </label>
            <input
              id="current-password"
              ref={passwordRef}
              type="password"
              autoComplete="current-password"
              className="field-input"
              placeholder="••••••••"
              value={previousPassword}
              onChange={(e) => setPreviousPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyPreviousPassword()}
            />

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="btn-quiet">
                Cancel
              </button>
              <button type="button" onClick={verifyPreviousPassword} className="btn-primary">
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold capitalize text-primary-900">
              {isPassword ? `Set a new ${label}` : `Update your ${label}`}
            </h3>

            <label className="field-label mt-5" htmlFor="new-value">
              {isPassword ? 'New password' : `New ${label}`}
            </label>
            <input
              id="new-value"
              // A password field must never be a plain text input.
              type={isPassword ? 'password' : 'text'}
              autoComplete={isPassword ? 'new-password' : 'off'}
              className="field-input"
              placeholder={isPassword ? 'At least 8 characters' : `New ${label}`}
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />

            {isPassword && <p className="field-hint">Use 8 characters or more.</p>}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="btn-quiet">
                Cancel
              </button>
              <button type="button" disabled={saving} onClick={save} className="btn-primary">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EditValues;