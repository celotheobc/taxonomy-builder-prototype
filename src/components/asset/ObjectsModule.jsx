import TypeIndicator from '../shared/TypeIndicator';
import TableSectionHeader from './TableSectionHeader';
import styles from './RelationshipsModule.module.css';

export default function ObjectsModule({ rows = [], showAdd = false, onAddObject }) {
  return (
    <section className={styles.module} aria-labelledby="objects-heading">
      <TableSectionHeader
        headingId="objects-heading"
        title="Objects"
        count={rows.length}
        showAdd={showAdd}
        insertProps={{
          lockedScope: 'object',
          onAddObject,
        }}
      />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Domain</th>
              <th>Relationships</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>
                  No objects in this perspective yet. Add objects in Configuration above.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className={styles.nameCell}>
                      <TypeIndicator kind="object" />
                      {row.name}
                    </span>
                  </td>
                  <td>{row.domain}</td>
                  <td>{row.relationshipCount}</td>
                  <td>
                    <span className={styles.included}>In perspective</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className={styles.note}>
        Object types included in this perspective configuration.
      </p>
    </section>
  );
}
