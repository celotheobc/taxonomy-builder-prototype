import { useState } from 'react';
import { useObjectTypeWorkspace } from './context/ObjectTypeWorkspaceContext';
import TaxonomyEditorLayout from './layout/TaxonomyEditorLayout';
import TaxonomyHierarchyEditor from './taxonomy/TaxonomyHierarchyEditor';
import { usePanelDimensionsV5 } from '../v5/layout/usePanelDimensionsV5';
import styles from './TaxonomyAssetView.module.css';

export default function TaxonomyAssetView({ taxonomyId, onOpenObjectType }) {
  const { getTaxonomy, updateTaxonomyMeta } = useObjectTypeWorkspace();
  const taxonomy = getTaxonomy(taxonomyId);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(true);
  const { rightWidth } = usePanelDimensionsV5();

  if (!taxonomy) {
    return <div className={styles.missing}>Taxonomy asset not found. Create subtypes from an Object Type first.</div>;
  }

  const visibleSubtypes = taxonomy.subtypes.filter((subtype) => !subtype.hidden);

  return (
    <TaxonomyEditorLayout
      mainContent={
        <div className={styles.workArea}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Taxonomy</p>
              <h1 className={styles.title}>{taxonomy.name}</h1>
              <p className={styles.subtitle}>
                Organises subtype object types created from{' '}
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => onOpenObjectType?.(taxonomy.sourceObjectTypeId)}
                >
                  {taxonomy.sourceObjectTypeName}
                </button>
              </p>
            </div>
            <span className={styles.statusBadge}>{taxonomy.status}</span>
          </header>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Parent object</h2>
            <p className={styles.lead}>
              This taxonomy was created when <strong>{taxonomy.sourceObjectTypeName}</strong> was
              split by <strong>{taxonomy.splitAttributeName}</strong>. The taxonomy organises the
              resulting subtype object types.
            </p>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => onOpenObjectType?.(taxonomy.sourceObjectTypeId)}
            >
              Open {taxonomy.sourceObjectTypeName}
            </button>
          </section>

          <section className={styles.card}>
            <TaxonomyHierarchyEditor subtypes={visibleSubtypes} />
          </section>
        </div>
      }
      rightInspector={
        <aside className={styles.inspector} style={{ width: rightCollapsed ? 40 : rightWidth }}>
          <header className={styles.inspectorHeader}>
            <span>Inspector</span>
            <button type="button" onClick={() => setRightCollapsed((v) => !v)}>
              {rightCollapsed ? '◂' : '▸'}
            </button>
          </header>
          {!rightCollapsed && (
            <div className={styles.inspectorBody}>
              <label className={styles.field}>
                <span>Name</span>
                <input
                  type="text"
                  value={taxonomy.name}
                  onChange={(event) => updateTaxonomyMeta(taxonomy.id, { name: event.target.value })}
                />
              </label>
              <label className={styles.field}>
                <span>Description</span>
                <textarea
                  rows={5}
                  value={taxonomy.description}
                  onChange={(event) => updateTaxonomyMeta(taxonomy.id, { description: event.target.value })}
                />
              </label>
              <dl className={styles.metaList}>
                <div><dt>Reference key</dt><dd>{taxonomy.referenceKey}</dd></div>
                <div><dt>Parent object</dt><dd>{taxonomy.sourceObjectTypeName}</dd></div>
                <div><dt>Split attribute</dt><dd>{taxonomy.splitAttributeName}</dd></div>
                <div><dt>Subtypes</dt><dd>{visibleSubtypes.length}</dd></div>
              </dl>
            </div>
          )}
        </aside>
      }
      bottomPanel={
        <section
          className={styles.bottomStub}
          style={{ height: bottomCollapsed ? 40 : 40 }}
          aria-hidden
        />
      }
    />
  );
}
