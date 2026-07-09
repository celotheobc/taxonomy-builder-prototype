import { agentContextMarkdown } from '../../../data/mockData';
import ResizeHandle from '../../v1_5/layout/ResizeHandle';
import styles from '../../v1_5/panels/BottomPanel.module.css';

const TABS = [
  { id: 'changelog', label: 'Change log' },
  { id: 'issues', label: 'Issues' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'agent', label: 'AI Context' },
];

export default function ProcessBottomPanel({
  activeTab,
  onTabChange,
  collapsed,
  onToggle,
  height,
  onResizeHeight,
  relationshipCount,
}) {
  return (
    <section
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}
      style={{ height: collapsed ? 40 : height }}
      aria-label="Process inventory"
    >
      {!collapsed && onResizeHeight && (
        <ResizeHandle axis="y" onDelta={onResizeHeight} ariaLabel="Resize bottom panel height" />
      )}
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.tabs} role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? styles.tabActive : styles.tab}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
                {tab.id === 'relationships' ? ` (${relationshipCount})` : ''}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={onToggle}
            aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {collapsed ? '▲' : '▼'}
          </button>
        </header>
        {!collapsed && (
          <div className={styles.body}>
            {activeTab === 'changelog' && (
              <p className={styles.empty}>No change log entries for this process yet.</p>
            )}
            {activeTab === 'issues' && (
              <p className={styles.empty}>No issues reported for this process.</p>
            )}
            {activeTab === 'relationships' && (
              <p className={styles.empty}>
                {relationshipCount} relationships defined in this process scope.
              </p>
            )}
            {activeTab === 'agent' && (
              <textarea
                className={styles.agentEditor}
                readOnly
                value={agentContextMarkdown}
                aria-label="Agent context"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
