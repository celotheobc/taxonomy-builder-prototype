import { useEffect, useMemo, useRef, useState } from 'react';
import {
  eventSources,
  metrics,
  objects,
  relationships,
  relationshipTableMeta,
} from '../../data/mockData';
import {
  ENTIRE_CONTEXT_MODEL_LABEL,
  getProcessAssetIds,
  PROCESS_FILTER_OPTIONS,
} from '../../utils/processInventory';
import styles from './InsertSearchPanel.module.css';

const SCOPES = [
  { id: 'all', label: 'All' },
  { id: 'object', label: 'Objects' },
  { id: 'event', label: 'Events' },
  { id: 'relationship', label: 'Relationships' },
  // Metrics hidden when onSelectMetric is omitted (v3 perspective builder demo)
  { id: 'metric', label: 'Metrics' },
];

function relationshipLabel(rel) {
  const sourceName = objects.find((o) => o.id === rel.source)?.name ?? rel.source;
  const targetName = objects.find((o) => o.id === rel.target)?.name ?? rel.target;
  const meta = relationshipTableMeta[rel.id];
  const name =
    meta?.name ??
    `${sourceName.replace(/\s+/g, '')}To${targetName.replace(/\s+/g, '')}`;
  return { name, sourceName, targetName };
}

export default function InsertSearchPanel({
  onSelectObject,
  onSelectEvent,
  onSelectMetric,
  onSelectRelationship,
  onClose,
  autoFocus = false,
  objectOptions,
  lockedScope = null,
  placeholder = 'Search objects, events, and metrics…',
  flatResults = false,
  showProcessFilter = false,
  variant = 'default',
}) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState(lockedScope ?? 'all');
  const [processFilter, setProcessFilter] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (name, domain) =>
      !q || name.toLowerCase().includes(q) || domain.toLowerCase().includes(q);

    const { objectIds, eventIds } = getProcessAssetIds(processFilter);

    const items = [];
    const defaultLimit = scope === 'all' ? 10 : 8;

    if (scope === 'all' || scope === 'object') {
      objects
        .filter((o) => match(o.name, o.domain))
        .filter((o) => !objectIds || objectIds.has(o.id))
        .forEach((o) => {
          items.push({ kind: 'object', id: o.id, name: o.name, domain: o.domain, meta: o });
        });
    }

    if (scope === 'all' || scope === 'event') {
      eventSources
        .filter((e) => match(e.name, e.domain))
        .filter((e) => !eventIds || eventIds.has(e.id))
        .forEach((e) => {
          items.push({ kind: 'event', id: e.id, name: e.name, domain: e.domain });
        });
    }

    if (onSelectMetric && (scope === 'all' || scope === 'metric')) {
      metrics
        .filter((m) => match(m.name, m.domain))
        .forEach((m) => {
          items.push({ kind: 'metric', id: m.id, name: m.name, domain: m.domain });
        });
    }

    if (onSelectRelationship && (scope === 'all' || scope === 'relationship')) {
      relationships
        .filter((rel) => {
          const { name, sourceName, targetName } = relationshipLabel(rel);
          return (
            !q ||
            name.toLowerCase().includes(q) ||
            sourceName.toLowerCase().includes(q) ||
            targetName.toLowerCase().includes(q)
          );
        })
        .forEach((rel) => {
          const { name, sourceName, targetName } = relationshipLabel(rel);
          items.push({
            kind: 'relationship',
            id: rel.id,
            name,
            domain: `${sourceName} → ${targetName}`,
          });
        });
    }

    const sorted = items.sort((a, b) => a.name.localeCompare(b.name));
    return q ? sorted : sorted.slice(0, defaultLimit);
  }, [query, scope, processFilter, onSelectRelationship, onSelectMetric]);

  const handlePick = (item) => {
    if (item.kind === 'object') {
      onSelectObject?.(item.id, objectOptions);
    } else if (item.kind === 'event') {
      onSelectEvent?.(item.id);
    } else if (item.kind === 'relationship') {
      onSelectRelationship?.(item.id);
    } else {
      onSelectMetric?.(item.id);
    }
    setQuery('');
    onClose?.();
  };

  const kindClass = (kind) => {
    if (kind === 'event') return styles.kindEvent;
    if (kind === 'metric') return styles.kindMetric;
    if (kind === 'relationship') return styles.kindRelationship;
    return styles.kindObject;
  };

  const kindLabel = (kind) => {
    if (kind === 'event') return 'Event';
    if (kind === 'metric') return 'Metric';
    if (kind === 'relationship') return 'Relationship';
    return 'Object';
  };

  const isExpansion = variant === 'expansion';
  const resultsClassName = [
    styles.results,
    flatResults || isExpansion ? styles.resultsFlat : '',
    isExpansion ? styles.resultsExpansion : '',
  ]
    .filter(Boolean)
    .join(' ');

  const visibleScopes = lockedScope
    ? []
    : SCOPES.filter((s) => {
        if (isExpansion && (s.id === 'relationship' || s.id === 'metric')) return false;
        if (s.id === 'relationship' && !onSelectRelationship) return false;
        if (s.id === 'object' && !onSelectObject) return false;
        if (s.id === 'event' && !onSelectEvent) return false;
        if (s.id === 'metric' && !onSelectMetric) return false;
        return true;
      });

  const panelClass = [
    styles.panel,
    isExpansion ? styles.panelExpansion : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={panelClass}>
      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search to insert"
        aria-haspopup="listbox"
      />

      {showProcessFilter && (
        <div className={isExpansion ? styles.searchWithinRow : styles.processRow}>
          <label
            className={isExpansion ? styles.searchWithinLabel : styles.processLabel}
            htmlFor="insert-process-filter"
          >
            {isExpansion ? 'Search within' : 'Process'}
          </label>
          <select
            id="insert-process-filter"
            className={isExpansion ? styles.searchWithinSelect : styles.processSelect}
            value={processFilter}
            onChange={(e) => setProcessFilter(e.target.value)}
            aria-label={isExpansion ? 'Search within' : 'Process filter'}
          >
            <option value="">{isExpansion ? ENTIRE_CONTEXT_MODEL_LABEL : 'All processes'}</option>
            {isExpansion ? (
              <optgroup label="Processes">
                {PROCESS_FILTER_OPTIONS.map((process) => (
                  <option key={process.id} value={process.id}>
                    {process.label}
                  </option>
                ))}
              </optgroup>
            ) : (
              PROCESS_FILTER_OPTIONS.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.label}
                </option>
              ))
            )}
          </select>
        </div>
      )}

      {visibleScopes.length > 1 && (
        <div className={styles.scopeRow} role="group" aria-label="Search scope">
          {visibleScopes.map((s) => (
            <button
              key={s.id}
              type="button"
              className={scope === s.id ? styles.scopeActive : styles.scopeBtn}
              aria-pressed={scope === s.id}
              onClick={() => setScope(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {results.length > 0 ? (
        <ul className={resultsClassName} role="listbox">
          {results.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <button
                type="button"
                className={styles.resultItem}
                role="option"
                onClick={() => handlePick(item)}
              >
                <span className={styles.resultMain}>
                  <span className={`${styles.kindBadge} ${kindClass(item.kind)}`}>
                    {kindLabel(item.kind)}
                  </span>
                  <span className={styles.name}>{item.name}</span>
                </span>
                <span className={styles.domain}>{item.domain}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          {isExpansion ? 'No matches — try another search term.' : 'No matches — try another term or scope.'}
        </p>
      )}
    </div>
  );
}
