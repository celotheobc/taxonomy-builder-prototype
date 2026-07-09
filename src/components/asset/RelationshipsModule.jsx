import TableSectionHeader from './TableSectionHeader';
import styles from './RelationshipsModule.module.css';

export default function RelationshipsModule({
  rows = [],
  alert = null,
  highlightedRelationshipId = null,
  onHighlightRelationship,
  showAdd = false,
  onAddRelationship,
}) {
  const showConflictColumn = Boolean(alert);

  return (
    <section className={styles.module} aria-labelledby="rel-heading">
      <TableSectionHeader
        headingId="rel-heading"
        title="Relationships"
        count={rows.length}
        showAdd={showAdd}
        insertProps={{
          lockedScope: 'relationship',
          onAddRelationship,
        }}
      />

      {alert && (
        <div className={styles.alert} role="alert">
          <span className={styles.alertIcon} aria-hidden>
            ⚠
          </span>
          <div className={styles.alertBody}>
            <strong>{alert.title}</strong>
            <p>{alert.message}</p>
          </div>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Source</th>
              <th>Target</th>
              {showConflictColumn && <th>In loop</th>}
              <th>Status</th>
              <th>Cardinality</th>
              <th>Join / Table</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={showConflictColumn ? 8 : 7} className={styles.empty}>
                  No relationships in this perspective yet. Add objects in Configuration
                  above — rows appear when both source and target are included.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={[
                    row.isConflicting && alert ? styles.rowConflict : '',
                    highlightedRelationshipId === row.id
                      ? row.isConflicting && alert
                        ? styles.rowHighlightCycle
                        : styles.rowHighlight
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ') || undefined}
                  tabIndex={0}
                  onMouseEnter={() => onHighlightRelationship?.(row.id)}
                  onMouseLeave={() => onHighlightRelationship?.(null)}
                  onFocus={() => onHighlightRelationship?.(row.id)}
                  onBlur={() => onHighlightRelationship?.(null)}
                >
                  <td>{row.name}</td>
                  <td>{row.source}</td>
                  <td>{row.target}</td>
                  {showConflictColumn && (
                    <td>{row.isConflicting ? 'Yes' : '—'}</td>
                  )}
                  <td>
                    {row.isConflicting && alert ? (
                      <span className={styles.needsChoice}>Needs choice</span>
                    ) : (
                      <span className={styles.included}>In perspective</span>
                    )}
                  </td>
                  <td>{row.cardinality}</td>
                  <td>{row.join}</td>
                  <td>{row.type}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className={styles.note}>
        {alert
          ? 'Remove one connection in the loop on the graph to validate the perspective.'
          : 'Reflects type-to-type relationships between included objects.'}
      </p>
    </section>
  );
}
