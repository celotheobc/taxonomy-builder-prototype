import { useCallback, useRef, useState } from 'react';

const DEFAULT_MS = 2800;
const UNDO_MS = 8000;

export function useToast() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const dismissToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message, { undo } = {}) => {
      dismissToast();
      setToast({ message, undo: undo ?? null });
      timeoutRef.current = setTimeout(dismissToast, undo ? UNDO_MS : DEFAULT_MS);
    },
    [dismissToast],
  );

  return { toast, showToast, dismissToast };
}
