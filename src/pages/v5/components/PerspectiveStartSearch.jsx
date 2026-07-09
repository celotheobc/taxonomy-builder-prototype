import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { objects } from '../../../data/mockData';
import { ObjectTypeIcon, ProcessFlowIcon } from '../../../components/icons/ContextModelIcons';
import styles from './PerspectiveStartSearch.module.css';

const PROCESSES = [
  { id: 'order-to-cash', name: 'Order to Cash' },
  { id: 'procure-to-pay', name: 'Procure to Pay' },
  { id: 'accounts-payable', name: 'Accounts Payable' },
];

const DEFAULT_OBJECT_IDS = ['customer', 'sales-order', 'delivery', 'invoice'];

function matchesQuery(name, query) {
  return name.toLowerCase().includes(query);
}

export default function PerspectiveStartSearch({ onSelectObject, onSelectProcess }) {
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

  const { objectResults, processResults } = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return {
        objectResults: DEFAULT_OBJECT_IDS.map((id) => objects.find((o) => o.id === id)).filter(
          Boolean,
        ),
        processResults: PROCESSES,
      };
    }

    return {
      objectResults: objects.filter(
        (o) =>
          matchesQuery(o.name, q) ||
          matchesQuery(o.domain, q),
      ),
      processResults: PROCESSES.filter((p) => matchesQuery(p.name, q)),
    };
  }, [query]);

  const hasResults = objectResults.length > 0 || processResults.length > 0;

  return (
    <div className={styles.wrap} ref={rootRef}>
      <input
        type="search"
        className={styles.input}
        placeholder="Search objects or processes…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        aria-label="Search objects or processes"
        aria-expanded={open}
        aria-haspopup="listbox"
      />
      {open && hasResults && (
        <div className={styles.results} role="listbox">
          {objectResults.length > 0 && (
            <div className={styles.group}>
              <p className={styles.groupLabel}>Objects</p>
              <ul className={styles.groupList}>
                {objectResults.map((obj) => (
                  <li key={obj.id}>
                    <button
                      type="button"
                      className={styles.resultItem}
                      role="option"
                      onClick={() => {
                        onSelectObject(obj.id);
                        setQuery('');
                        close();
                      }}
                    >
                      <span className={`${styles.resultIcon} ${styles.resultIconObject}`}>
                        <ObjectTypeIcon size={14} />
                      </span>
                      <span className={styles.resultName}>{obj.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {processResults.length > 0 && (
            <div className={styles.group}>
              <p className={styles.groupLabel}>Processes</p>
              <ul className={styles.groupList}>
                {processResults.map((process) => (
                  <li key={process.id}>
                    <button
                      type="button"
                      className={styles.resultItem}
                      role="option"
                      onClick={() => {
                        onSelectProcess(process.id);
                        setQuery('');
                        close();
                      }}
                    >
                      <span className={`${styles.resultIcon} ${styles.resultIconProcess}`}>
                        <ProcessFlowIcon size={14} />
                      </span>
                      <span className={styles.resultName}>{process.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { PROCESSES as START_PROCESSES };
