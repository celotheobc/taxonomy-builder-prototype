import TypeIndicator from '../shared/TypeIndicator';
import TableSectionHeader from './TableSectionHeader';
import styles from './RelationshipsModule.module.css';

export default function EventSourcesModule({
  rows = [],
  showAdd = false,
  onAddEvent,
}) {
  return (
    <section className={styles.module} aria-labelledby="events-heading">
      <TableSectionHeader
        headingId="events-heading"
        title="Event Sources"
        count={rows.length}
        showAdd={showAdd}
        insertProps={{
          lockedScope: 'event',
          onAddEvent,
        }}
      />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Domain</th>
              <th>Linked object</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>
                  No event sources in this perspective yet. Add events from the graph
                  discovery controls.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className={styles.nameCell}>
                      <TypeIndicator kind="eventSource" />
                      {row.name}
                    </span>
                  </td>
                  <td>{row.domain}</td>
                  <td>{row.linkedObject}</td>
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
        Event sources scoped to objects in this perspective.
      </p>
    </section>
  );
}
