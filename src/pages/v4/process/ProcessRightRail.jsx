import { useState } from 'react';
import { getContextEntityDetail } from '../../v3/stage1/contextModelDetail';
import ContextModelDetailIcon from '../../v3/stage1/ContextModelDetailIcon';
import CreatePerspectiveMenu from './CreatePerspectiveMenu';
import {
  InspectorRow,
  InspectorSection,
} from '../../v1_5/inspector/inspectorParts';
import inspectorStyles from '../../v1_5/inspector/inspector.module.css';
import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import styles from './ProcessRightRail.module.css';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'settings', label: 'Settings' },
];

export default function ProcessRightRail({
  processId,
  processLabel,
  associatedPerspectives,
  onCreateEntire,
  onSelectSubset,
  width,
  collapsed,
  onToggle,
  onResizeWidth,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const detail = getContextEntityDetail('process', processId);

  return (
    <aside
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}
      style={{ width: collapsed ? 40 : width }}
      aria-label="Process inspector"
    >
      {!collapsed && onResizeWidth && (
        <ResizeHandle
          axis="x"
          onDelta={(delta) => onResizeWidth(-delta)}
          ariaLabel="Resize right panel width"
        />
      )}
      <div className={styles.panel}>
        <header className={styles.panelHeader}>
          <div className={styles.tabs} role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? styles.tabActive : styles.tab}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={onToggle}
            aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {collapsed ? '‹' : '›'}
          </button>
        </header>

        {!collapsed && (
          <div className={styles.panelBody}>
            {activeTab === 'overview' && (
              <>
                <InspectorSection title="Process overview">
                  <div className={styles.overviewHero}>
                    <ContextModelDetailIcon kind="process" />
                    <p className={styles.overviewName}>{processLabel || detail.name}</p>
                    <p className={styles.overviewDesc}>{detail.description}</p>
                  </div>
                  <InspectorRow label="Technical name">{detail.technicalName}</InspectorRow>
                  <InspectorRow label="Domain">{detail.domain}</InspectorRow>
                </InspectorSection>

                <InspectorSection title="Perspectives">
                  {associatedPerspectives.length === 0 ? (
                    <p className={inspectorStyles.muted}>No associated perspectives</p>
                  ) : (
                    <ul className={styles.perspectiveList}>
                      {associatedPerspectives.map((item) => (
                        <li key={item.id} className={styles.perspectiveItem}>
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className={styles.createWrap}>
                    <CreatePerspectiveMenu
                      open={menuOpen}
                      onOpenChange={setMenuOpen}
                      onCreateEntire={onCreateEntire}
                      onSelectSubset={onSelectSubset}
                    />
                  </div>
                </InspectorSection>
              </>
            )}

            {activeTab === 'configuration' && (
              <InspectorSection title="Process configuration">
                <p className={inspectorStyles.muted}>
                  Event log mapping and relationship rules for this process.
                </p>
              </InspectorSection>
            )}

            {activeTab === 'settings' && (
              <InspectorSection title="Settings">
                <p className={inspectorStyles.muted}>
                  Package visibility and deployment settings for this process asset.
                </p>
              </InspectorSection>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
