import styles from './TaxonomyHierarchyEditor.module.css';

/**
 * Read-only hierarchy surface — structured for future group editing and drag-and-drop.
 */
export default function TaxonomyHierarchyEditor({ subtypes, groupPreview = null }) {
  const visibleSubtypes = subtypes.filter((subtype) => !subtype.hidden);
  const hasGroups = Boolean(groupPreview?.length);

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>Taxonomy structure</span>
        <button type="button" className={styles.toolbarBtn} disabled title="Coming soon">
          + Add group
        </button>
      </div>

      <div className={styles.canvas}>
        {hasGroups ? (
          groupPreview.map((group) => (
            <section key={group.id} className={styles.groupBlock}>
              <header className={styles.groupHeader}>
                <span className={styles.groupDrag} aria-hidden>
                  ⠿
                </span>
                <span className={styles.groupName}>{group.label}</span>
              </header>
              <ul className={styles.memberList}>
                {group.members.map((member) => (
                  <li key={member.id} className={styles.memberRow}>
                    <span className={styles.memberDrag} aria-hidden>
                      ⠿
                    </span>
                    <span className={styles.memberIcon} aria-hidden />
                    <span className={styles.memberName}>{member.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <section className={styles.groupBlock}>
            <header className={styles.groupHeader}>
              <span className={styles.groupDrag} aria-hidden>
                ⠿
              </span>
              <span className={styles.groupName}>Root level</span>
              <span className={styles.groupHint}>Flat · groups coming soon</span>
            </header>
            <ul className={styles.memberList}>
              {visibleSubtypes.map((subtype) => (
                <li key={subtype.id} className={styles.memberRow}>
                  <span className={styles.memberDrag} aria-hidden>
                    ⠿
                  </span>
                  <span className={styles.memberIcon} aria-hidden />
                  <span className={styles.memberName}>{subtype.label}</span>
                  <span className={styles.memberMeta}>{subtype.matchingValue}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <p className={styles.futureNote}>
        This page will become the taxonomy editor — organise subtypes into groups, reorder members,
        and manage hierarchy over time.
      </p>
    </div>
  );
}
