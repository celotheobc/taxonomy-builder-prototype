import { useEffect, useMemo, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { objects } from '../../data/mockData';
import styles from './ContextualDiscoveryMenu.module.css';

const CATEGORIES = [
  { id: 'objects', label: 'Objects' },
  { id: 'events', label: 'Events' },
  { id: 'metrics', label: 'Metrics' },
];

export default function ContextualDiscoveryMenu({
  selection,
  counts,
  onReveal,
  onClose,
}) {
  const { getNode, flowToScreenPosition } = useReactFlow();
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocPointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('mousedown', onDocPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const style = useMemo(() => {
    if (!selection?.objectId) return null;
    const node = getNode(selection.objectId);
    if (!node) return null;
    const screen = flowToScreenPosition({
      x: node.position.x + 74,
      y: node.position.y - 8,
    });
    return { left: screen.x, top: screen.y };
  }, [selection?.objectId, getNode, flowToScreenPosition]);

  if (!selection?.objectId || !style || !counts) return null;

  const name = objects.find((o) => o.id === selection.objectId)?.name ?? selection.objectId;

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={style}
      role="dialog"
      aria-label={`Discover from ${name}`}
    >
      <div className={styles.header}>
        <strong>{name}</strong>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <ul className={styles.list}>
        {CATEGORIES.map((cat) => (
          <li key={cat.id}>
            <button
              type="button"
              className={
                selection.revealedCategory === cat.id ? styles.active : styles.item
              }
              onClick={() => onReveal(cat.id)}
            >
              {cat.label}
              <span className={styles.count}>({counts[cat.id]})</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
