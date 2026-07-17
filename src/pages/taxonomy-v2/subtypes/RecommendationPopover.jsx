import { useEffect, useRef } from 'react';
import styles from './SubtypesSection.module.css';

export default function RecommendationPopover({ open, title, bullets, onClose, anchorRef }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      const anchor = anchorRef?.current;
      const popover = popoverRef.current;
      if (popover?.contains(event.target) || anchor?.contains(event.target)) return;
      onClose?.();
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div ref={popoverRef} className={styles.recommendationPopover} role="dialog" aria-label={title}>
      <p className={styles.recommendationPopoverTitle}>{title}</p>
      <ul className={styles.recommendationPopoverList}>
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </div>
  );
}
