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
    <div className="fixed inset-0 bg-blue-300 bg-opacity-40 flex justify-center items-center z-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        {isPassword && !unlocked ? (
          <>
            <h3 className="text-lg font-semibold mb-4">Confirm your current password</h3>
            <input
              ref={passwordRef}
              type="password"
              autoComplete="current-password"
              className="border px-3 py-2 w-full mb-4 rounded"
              placeholder="Current password"
              value={previousPassword}
              onChange={(e) => setPreviousPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyPreviousPassword()}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyPreviousPassword}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4 capitalize">
              {isPassword ? `Set a new ${label}` : `Update your ${label}`}
            </h3>

            <input
              // A password field must never be a plain text input.
              type={isPassword ? 'password' : 'text'}
              autoComplete={isPassword ? 'new-password' : 'off'}
              className="border px-3 py-2 w-full mb-4 rounded"
              placeholder={isPassword ? 'New password' : `New ${label}`}
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />

            {isPassword && <p className="text-xs text-gray-500 mb-3">At least 8 characters.</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded"
              >
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