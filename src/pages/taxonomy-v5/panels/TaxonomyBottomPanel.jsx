import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import panelTabStyles from '../../v5/components/PanelTabs.module.css';
import styles from '../../v1_5/panels/BottomPanel.module.css';
import { getDataPreviewRows, getPreviewColumns } from '../../../data/mockDataPreview';
import {
  getNodeBreadcrumb,
  getSiblingNodes,
} from '../../../data/taxonomyTreeModel';
import HierarchyList from '../hierarchy/HierarchyList';
import hierarchyStyles from '../hierarchy/Hierarchy.module.css';
import localStyles from './TaxonomyBottomPanel.module.css';

const TABS = [
  { id: 'preview', label: 'Data Preview' },
  { id: 'taxonomy', label: 'Created Taxonomy' },
  { id: 'values', label: 'Subtype Mapping' },
];

function tabLabel(tab, counts) {
  if (!tab.countKey) return tab.label;
  const count = counts[tab.countKey];
  return count ? `${tab.label} (${count})` : tab.label;
}

export default function TaxonomyBottomPanel({
  objectTypeId,
  objectTypeName,
  treeNodes = [],
  mappingRows = [],
  activeTab,
  onTabChange,
  collapsed,
  onToggle,
  height = 220,
  onResizeHeight,
  generatedTaxonomy,
  previewSubtypeId,
  onPreviewSubtype,
}) {
  const previewRows = getDataPreviewRows(objectTypeId, previewSubtypeId);
  const previewColumns = getPreviewColumns(objectTypeId);
  const tabCounts = { values: mappingRows.length };
  const siblings = previewSubtypeId ? getSiblingNodes(previewSubtypeId, treeNodes) : [];
  const previewNode = treeNodes.find((node) => node.id === previewSubtypeId) ?? null;
  const breadcrumb = previewSubtypeId
    ? getNodeBreadcrumb(previewSubtypeId, treeNodes, objectTypeName)
    : null;

  return (
    <section
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}
      style={{ height: collapsed ? 40 : height }}
      aria-label="Object type supporting data"
    >
      {!collapsed && onResizeHeight && (
        <ResizeHandle axis="y" onDelta={onResizeHeight} ariaLabel="Resize bottom panel height" />
      )}
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={panelTabStyles.bar} role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? panelTabStyles.tabActive : panelTabStyles.tab}
                onClick={() => onTabChange(tab.id)}
              >
                {tabLabel(tab, tabCounts)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`${styles.collapseBtn} ${localStyles.collapseBtn}`}
            onClick={onToggle}
            aria-label={collapsed ? 'Expand bottom panel' : 'Collapse bottom panel'}
          >
            {collapsed ? '▴' : '▾'}
          </button>
        </header>

        {!collapsed && (
          <div className={styles.body}>
            {activeTab === 'preview' && (
              <div className={localStyles.tableWrap}>
                {previewSubtypeId ? (
                  <>
                    <p className={localStyles.lead}>
                      <span className={localStyles.previewEyebrow}>Data preview</span>
                      <span className={hierarchyStyles.previewBreadcrumb}>
                        <strong>{breadcrumb}</strong>
                      </span>
                    </p>
                    {siblings.length > 0 ? (
                      <div className={hierarchyStyles.siblingSwitcher} role="tablist" aria-label="Sibling subtypes">
                        {[previewNode, ...siblings].filter(Boolean).map((node) => (
                          <button
                            key={node.id}
                            type="button"
                            role="tab"
                            aria-selected={node.id === previewSubtypeId}
                            className={
                              node.id === previewSubtypeId
                                ? hierarchyStyles.siblingBtnActive
                                : hierarchyStyles.siblingBtn
                            }
                            onClick={() => onPreviewSubtype?.(node.id)}
                          >
                            {node.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className={localStyles.lead}>Select a subtype in the hierarchy to preview matching data.</p>
                )}
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {previewColumns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => (
                      <tr key={row.id}>
                        {previewColumns.map((column) => (
                          <td key={column.key}>{row[column.key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'taxonomy' && (
              <div className={localStyles.taxonomyTab}>
                {generatedTaxonomy && treeNodes.length > 0 ? (
                  <>
                    <p className={localStyles.lead}>
                      Linked taxonomy <strong>{generatedTaxonomy.name}</strong> reflects the same
                      recursive specialisation hierarchy.
                    </p>
                    <HierarchyList
                      objectTypeId={objectTypeId}
                      objectTypeName={objectTypeName}
                      nodes={treeNodes}
                      rootSplitAttributeId={generatedTaxonomy?.splitAttributeId}
                      expandedNodeIds={treeNodes.map((node) => node.id)}
                      taxonomyId={generatedTaxonomy?.id}
                      taxonomyName={generatedTaxonomy?.name}
                      readOnly
                    />
                  </>
                ) : (
                  <p className={styles.empty}>Create subtypes to add a linked taxonomy asset.</p>
                )}
              </div>
            )}

            {activeTab === 'values' && (
              <div className={localStyles.tableWrap}>
                {mappingRows.length > 0 ? (
                  <>
                    <p className={localStyles.lead}>
                      How each subtype is derived from split attributes and attribute values.
                    </p>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Subtype</th>
                          <th>Parent</th>
                          <th>Split attribute</th>
                          <th>Attribute value</th>
                          <th>Rows</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappingRows.map((row) => (
                          <tr key={row.id}>
                            <td>{row.subtype}</td>
                            <td>{row.parent}</td>
                            <td>{row.splitAttribute}</td>
                            <td>{row.attributeValue}</td>
                            <td>{row.rows.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p className={styles.empty}>No subtype mapping until subtypes are created.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
