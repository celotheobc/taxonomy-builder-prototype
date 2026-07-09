import GraphInsertPopover from './GraphInsertPopover';
import CanvasSuggestionsControls from './CanvasSuggestionsControls';
import styles from './PerspectiveExpansionPanel.module.css';

export default function PerspectiveExpansionPanel({
  onAddObject,
  onAddEvent,
  onAddMetric,
  hideMetrics = false,
  discovery,
  showProcessFilter = false,
}) {
  if (!discovery) return null;

  const showSuggestions = !discovery.showOnlyIncluded;

  return (
    <div
      className={`${styles.panel} ${showSuggestions ? styles.panelExpanded : ''}`}
      role="region"
      aria-label="Perspective expansion"
    >
      <GraphInsertPopover
        onAddObject={onAddObject}
        onAddEvent={onAddEvent}
        onAddMetric={hideMetrics ? undefined : onAddMetric}
        variant="expansion"
        showProcessFilter={showProcessFilter}
      />
      <div className={styles.divider} aria-hidden />
      <CanvasSuggestionsControls
        variant="expansion"
        showSuggestions={showSuggestions}
        onToggleShowSuggestions={(on) => discovery.onSetShowOnlyIncluded?.(!on)}
        filters={discovery.filters}
        onToggleType={discovery.onToggle}
        disabled={discovery.disabled}
        hideMetrics={hideMetrics}
      />
    </div>
  );
}
