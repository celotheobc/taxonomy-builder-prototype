import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import inspectorStyles from '../../v5/inspector/RightInspector.module.css';
import InspectorContent from './InspectorContent';
import styles from './TaxonomyRightInspector.module.css';

export default function TaxonomyRightInspector({
  objectTypeId,
  subtypeEntry = null,
  collapsed,
  onToggle,
  width = 360,
  onResizeWidth,
  onOpenTaxonomy,
}) {
  return (
    <aside
      className={`${inspectorStyles.shell} ${collapsed ? inspectorStyles.shellCollapsed : ''}`}
      style={{ width: collapsed ? 40 : width }}
      aria-label="Object Type inspector"
    >
      {!collapsed && onResizeWidth && (
        <ResizeHandle axis="x" onDelta={onResizeWidth} ariaLabel="Resize inspector width" />
      )}
      <div className={inspectorStyles.panel}>
        <header className={inspectorStyles.panelHeader}>
          <span className={styles.headerTitle}>Inspector</span>
          <button type="button" className={inspectorStyles.collapseBtn} onClick={onToggle}>
            {collapsed ? '◂' : '▸'}
          </button>
        </header>

        {!collapsed && (
          <div className={inspectorStyles.panelBody}>
            <InspectorContent
              objectTypeId={objectTypeId}
              subtypeEntry={subtypeEntry}
              onOpenTaxonomy={onOpenTaxonomy}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
