import { getObjectType } from '../../../data/mockObjectTypes';
import ObjectTypeSectionCard from './ObjectTypeSectionCard';
import styles from './ObjectTypeSectionCard.module.css';

export default function RelationshipsSection({
  objectTypeId,
  selectedRelationshipId,
  onSelectRelationship,
  createDisabled = false,
}) {
  const objectType = getObjectType(objectTypeId);

  return (
    <ObjectTypeSectionCard
      title="Relationships"
      count={objectType.relationships.length}
      actions={
        <>
          <button type="button" className={styles.filterBtn} aria-label="Filter">
            ⊘
          </button>
          <button
            type="button"
            className={styles.actionBtnPrimary}
            disabled={createDisabled}
            title={
              createDisabled
                ? 'Relationships are defined on the parent object type'
                : undefined
            }
          >
            + Create
          </button>
        </>
      }
    >
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Target</th>
              <th>Cardinality</th>
              <th>Join / table</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {objectType.relationships.map((row) => (
              <tr
                key={row.id}
                className={selectedRelationshipId === row.id ? styles.rowSelected : undefined}
                tabIndex={0}
                onClick={() => onSelectRelationship(row.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectRelationship(row.id);
                  }
                }}
              >
                <td>{row.name}</td>
                <td>{row.target}</td>
                <td>{row.cardinality}</td>
                <td>{row.joinTable}</td>
                <td>{row.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ObjectTypeSectionCard>
  );
}
