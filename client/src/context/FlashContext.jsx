/* eslint-disable react-refresh/only-export-components --
 * A context file is expected to export both the provider component and the
 * hook that reads it; splitting them across files would just add indirection.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Flashpopup from '../components/flashpopup';

/**
 * Flash (toast) messages.
 *
 * Every page used to keep its own copy of this state and a `setTimeout` that
 * captured a stale `flashPopup` object, so a second message could be lost or the
 * first could never be dismissed. This hook owns a queue and cleans up its own
 * timers.
 */

const FlashContext = createContext(null);

const DEFAULT_DURATION = 3000;

export function FlashProvider({ children }) {
  const [flash, setFlash] = useState({ visible: false, message: '', type: '' });
  const timerRef = useRef(null);

  const triggerFlash = useCallback((message, type = 'error', duration = DEFAULT_DURATION) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setFlash({ visible: true, message, type });
    timerRef.current = setTimeout(() => {
      setFlash((current) => ({ ...current, visible: false }));
    }, duration);
  }, []);

  const value = useMemo(
    () => ({
      triggerFlash,
      success: (message) => triggerFlash(message, 'success'),
      error: (message) => triggerFlash(message, 'error'),
    }),
    [triggerFlash]
  );

  return (
    <FlashContext.Provider value={value}>
      {children}
      <Flashpopup visible={flash.visible} message={flash.message} type={flash.type} />
    </FlashContext.Provider>
  );
}

export function useFlash() {
  const context = useContext(FlashContext);
  if (!context) throw new Error('useFlash must be used inside a <FlashProvider>');
  return context;
}

export default FlashContext;