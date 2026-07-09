import { useState } from 'react';
import { formatSelectionSummary } from '../data/contextModelData';
import { getStudioPerspectives, getStudioProcesses } from '../shell/studioAssets';
import AssetActionPopover from './AssetActionPopover';
import styles from './AssetSelectionBar.module.css';

const PERSPECTIVES = getStudioPerspectives();
const PROCESSES = getStudioProcesses();

export default function AssetSelectionBar({
  open,
  selectedObjects,
  selectedEvents,
  onCancel,
  variant = 'context',
  onCreatePerspective,
  onAddToNewPerspective,
  onAddToPerspective,
  onAddToProcess,
  onAddToNewProcess,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const objectCount = selectedObjects.size;
  const eventCount = selectedEvents.size;
  const summary = formatSelectionSummary(objectCount, eventCount);
  const isEmpty = objectCount === 0 && eventCount === 0;
  const hasSelection =
    variant === 'process' ? objectCount > 0 || eventCount > 0 : objectCount > 0;

  const setMenuOpen = (menu) => (next) => {
    setOpenMenu(next ? menu : null);
  };

  return (
    <div
      className={`${styles.bar} ${open ? styles.barOpen : ''}`}
      role="region"
      aria-label="Asset selection"
      aria-hidden={!open}
    >
      <div className={styles.inner}>
        <p className={`${styles.summary} ${isEmpty ? styles.summaryEmpty : ''}`}>
          {summary}
        </p>

        <div className={styles.actions}>
          {variant === 'process' ? (
            <>
              <button
                type="button"
                className={styles.actionBtn}
                disabled={!hasSelection}
                onClick={onCreatePerspective}
              >
                Create perspective
              </button>
              <button type="button" className={styles.cancelBtn} onClick={onCancel}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <AssetActionPopover
                label="Add to perspective"
                disabled={!hasSelection}
                open={openMenu === 'perspective'}
                onOpenChange={setMenuOpen('perspective')}
                items={PERSPECTIVES}
                newItemLabel="New perspective"
                menuAriaLabel="Add to perspective"
                onSelectItem={onAddToPerspective}
                onSelectNew={onAddToNewPerspective}
              />

              <AssetActionPopover
                label="Add to process"
                disabled={!hasSelection}
                open={openMenu === 'process'}
                onOpenChange={setMenuOpen('process')}
                items={PROCESSES}
                newItemLabel="New process"
                menuAriaLabel="Add to process"
                onSelectItem={onAddToProcess}
                onSelectNew={onAddToNewProcess}
              />

              <button
                type="button"
                className={styles.actionBtn}
                disabled
                title="Prototype only"
              >
                Bookmark
              </button>

              <button type="button" className={styles.cancelBtn} onClick={onCancel}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
