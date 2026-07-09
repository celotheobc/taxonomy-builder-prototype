import { useCallback, useState } from 'react';
import ContextModelGraph from './ContextModelGraph';
import ContextModelDetailPanel from './ContextModelDetailPanel';
import AssetSelectionBar from './AssetSelectionBar';
import styles from './ContextModelBrowser.module.css';

export const SELECT_ASSETS_LABEL = 'Select assets';

export default function ContextModelBrowser({
  selectionMode,
  onEnterSelectionMode,
  onCancelSelection,
  selectedObjects,
  selectedEvents,
  onToggleObject,
  onToggleEvent,
  onAddToNewPerspective,
  onAddToPerspective,
  onAddToProcess,
  onAddToNewProcess,
}) {
  const [focusedNode, setFocusedNode] = useState(null);

  const handleEnterSelectionMode = useCallback(() => {
    setFocusedNode(null);
    onEnterSelectionMode?.();
  }, [onEnterSelectionMode]);

  const handleAddToPerspective = useCallback(
    (kind, entityId) => {
      if (!selectionMode) handleEnterSelectionMode();
      if (kind === 'object') onToggleObject?.(entityId);
      if (kind === 'event') onToggleEvent?.(entityId);
    },
    [selectionMode, handleEnterSelectionMode, onToggleObject, onToggleEvent],
  );

  const inPerspective =
    focusedNode &&
    ((focusedNode.kind === 'object' && selectedObjects.has(focusedNode.entityId)) ||
      (focusedNode.kind === 'event' && selectedEvents.has(focusedNode.entityId)));

  return (
    <div className={styles.browser}>
      <div className={styles.canvasRow}>
        <div
          className={`${styles.graphHost} ${selectionMode ? styles.selectionActive : ''}`}
        >
          <ContextModelGraph
            selectionMode={selectionMode}
            selectedObjects={selectedObjects}
            selectedEvents={selectedEvents}
            focusedNode={focusedNode}
            onFocusNode={setFocusedNode}
            onToggleObject={onToggleObject}
            onToggleEvent={onToggleEvent}
            detailOpen={Boolean(focusedNode) && !selectionMode}
          />
          {!selectionMode && (
            <button
              type="button"
              className={styles.floatingAction}
              onClick={handleEnterSelectionMode}
            >
              {SELECT_ASSETS_LABEL}
            </button>
          )}
          <AssetSelectionBar
            open={selectionMode}
            selectedObjects={selectedObjects}
            selectedEvents={selectedEvents}
            onCancel={onCancelSelection}
            onAddToNewPerspective={onAddToNewPerspective}
            onAddToPerspective={onAddToPerspective}
            onAddToProcess={onAddToProcess}
            onAddToNewProcess={onAddToNewProcess}
          />
        </div>
        {focusedNode && !selectionMode && (
          <ContextModelDetailPanel
            kind={focusedNode.kind}
            entityId={focusedNode.entityId}
            inPerspective={Boolean(inPerspective)}
            onClose={() => setFocusedNode(null)}
            onAddToPerspective={handleAddToPerspective}
          />
        )}
      </div>
    </div>
  );
}
