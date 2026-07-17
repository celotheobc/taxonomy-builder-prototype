import { ManageEmptyState } from './SubtypeDetailPanel';
import SubtypeTable from './SubtypeTable';
import styles from './SubtypesSection.module.css';

export default function SubtypesManagementMode({
  objectTypeId,
  subtypeEntries,
  onRenameSubtype,
  onPreviewSubtype,
  onOpenObjectType,
  onOpenTaxonomy,
  onDeleteSubtype,
}) {
  if (!subtypeEntries.length) {
    return (
      <div className={styles.manageEmptyShell}>
        <ManageEmptyState />
      </div>
    );
  }

  return (
    <div className={styles.subtypeTableShell}>
      <SubtypeTable
        objectTypeId={objectTypeId}
        subtypeEntries={subtypeEntries}
        onRenameSubtype={onRenameSubtype}
        onPreviewSubtype={onPreviewSubtype}
        onOpenObjectType={onOpenObjectType}
        onOpenTaxonomy={onOpenTaxonomy}
        onDeleteSubtype={onDeleteSubtype}
      />
    </div>
  );
}
