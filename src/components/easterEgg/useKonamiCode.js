import { useEffect, useRef } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

export function useKonamiCode(onSuccess) {
  const indexRef = useRef(0);
  const onSuccessRef = useRef(onSuccess);

  onSuccessRef.current = onSuccess;

  useEffect(() => {
    const handleKeyDown = (event) => {
      const expected = KONAMI_CODE[indexRef.current];

      if (event.code === expected) {
        indexRef.current += 1;
        if (indexRef.current === KONAMI_CODE.length) {
          indexRef.current = 0;
          onSuccessRef.current?.();
        }
        return;
      }

      indexRef.current = event.code === KONAMI_CODE[0] ? 1 : 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
