import DiscoveryControls from '../configuration/DiscoveryControls';
import CanvasSuggestionsControls from './CanvasSuggestionsControls';
import styles from './GraphCanvasControls.module.css';

export default function GraphCanvasControls({ discovery, variant = 'v1.5', hideMetrics = false }) {
  if (!discovery) return null;

  if (variant === 'v2') {
    const showSuggestions = !discovery.showOnlyIncluded;
    return (
      <CanvasSuggestionsControls
        showSuggestions={showSuggestions}
        onToggleShowSuggestions={(on) => discovery.onSetShowOnlyIncluded?.(!on)}
        filters={discovery.filters}
        onToggleType={discovery.onToggle}
        disabled={discovery.disabled}
        hideMetrics={hideMetrics}
      />
    );
  }

  return (
    <div className={styles.panel} role="region" aria-label="Discover on graph">
      <DiscoveryControls
        filters={discovery.filters}
        onToggle={discovery.onToggle}
        disabled={discovery.disabled}
        floating
        hideMetrics={hideMetrics}
      />
    </div>
  );
}
