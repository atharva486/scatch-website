import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios/api';
import { useFlash } from '../context/FlashContext';

/**
 * Logout behaviour shared by every navbar.
 *
 * Was copy-pasted into ten components, one of which called `awapi.post` (an
 * undefined identifier, so logout on the wishlist page threw), and two of which
 * called `navigate` without ever importing `useNavigate`, throwing a
 * ReferenceError. The `ref` guard also stops a double click firing two requests.
 */
/**
 * @param {string} redirectTo  where to land afterwards; the seller portal sends
 *                             its sellers to the seller login page.
 */
export default function useLogout(redirectTo = '/user/login') {
  const navigate = useNavigate();
  const { triggerFlash } = useFlash();
  const pending = useRef(false);

  return useCallback(async () => {
    if (pending.current) return;
    pending.current = true;

    try {
      await api.post('/api/user/logout');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      triggerFlash(err.friendlyMessage || 'Could not log out. Please try again.', 'error');
      pending.current = false;
    }
  }, [navigate, triggerFlash, redirectTo]);
}