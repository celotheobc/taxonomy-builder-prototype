import { StudioTabIcon } from './StudioIcons';
import styles from './StudioTabBar.module.css';

export default function StudioTabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
}) {
  return (
    <div className={styles.bar} role="tablist" aria-label="Open assets">
      <div className={styles.barLead}>
        <span className={styles.panelGlyph} aria-hidden>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2.5" y="3" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
            <path d="M6.5 8H11M6.5 5.5L4 8l2.5 2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <div className={styles.tabs}>
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              className={active ? styles.tabActive : styles.tab}
              role="presentation"
            >
              <button
                type="button"
                role="tab"
                aria-selected={active}
                className={styles.tabButton}
                onClick={() => onSelectTab(tab.id)}
              >
                <StudioTabIcon kind={tab.icon} />
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
              {tab.closable !== false && (
                <button
                  type="button"
                  className={styles.closeBtn}
                  aria-label={`Close ${tab.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className={styles.addBtn}
        aria-label="Open new tab"
        onClick={onAddTab}
      >
        +
      </button>
    </div>
  );
}
