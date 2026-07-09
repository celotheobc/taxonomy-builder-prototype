import { useCallback, useRef } from 'react';
import styles from './ResizeHandle.module.css';

export default function ResizeHandle({ axis, onDelta, ariaLabel }) {
  const dragging = useRef(false);

  const onPointerDown = useCallback(
    (event) => {
      event.preventDefault();
      dragging.current = true;
      const start = axis === 'x' ? event.clientX : event.clientY;

      const onPointerMove = (moveEvent) => {
        if (!dragging.current) return;
        const current = axis === 'x' ? moveEvent.clientX : moveEvent.clientY;
        const delta = last - current;
        last = current;
        if (delta !== 0) onDelta(delta);
      };

      let last = start;

      const onPointerUp = () => {
        dragging.current = false;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    },
    [axis, onDelta],
  );

  return (
    <div
      className={axis === 'x' ? styles.handleX : styles.handleY}
      role="separator"
      aria-orientation={axis === 'x' ? 'vertical' : 'horizontal'}
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
    />
  );
}
