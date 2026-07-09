import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { objects } from '../../data/mockData';
import styles from './ObjectSearch.module.css';

export default function ObjectSearch({ onSelect, placeholder = 'Search objects…' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;

    const onDocPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        close();
      }
    };

    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onDocPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return objects.slice(0, 6);
    return objects.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.domain.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className={styles.wrap} ref={rootRef}>
      <input
        type="search"
        className={styles.input}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        aria-label="Search objects"
        aria-expanded={open}
        aria-haspopup="listbox"
      />
      {open && results.length > 0 && (
        <ul className={styles.results} role="listbox">
          {results.map((obj) => (
            <li key={obj.id}>
              <button
                type="button"
                className={styles.resultItem}
                role="option"
                onClick={() => {
                  onSelect(obj.id);
                  setQuery('');
                  close();
                }}
              >
                <span className={styles.name}>{obj.name}</span>
                <span className={styles.meta}>
                  <span className={styles.domain}>{obj.domain}</span>
                  <span className={styles.count}>
                    {obj.relationshipCount} relationships
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
