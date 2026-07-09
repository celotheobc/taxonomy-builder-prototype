import theoBotAvatar from '../../../assets/theobot-avatar.png';
import { useInventoryPlacement } from '../inventory/InventoryPlacementContext';
import { isBottomInventory } from '../inventory/inventoryPlacement';
import styles from '../../v3/shell/StudioL0Nav.module.css';
import v6Styles from './StudioL0NavV6.module.css';

const SKELETON_SLOTS = 4;

export default function StudioL0NavV6({ onVersionChange }) {
  const { placement, togglePlacement } = useInventoryPlacement();
  const bottomMode = isBottomInventory(placement);

  return (
    <nav className={styles.nav} aria-label="Celonis navigation">
      {Array.from({ length: SKELETON_SLOTS }, (_, i) => (
        <div key={i} className={styles.skeleton} aria-hidden />
      ))}
      <div className={styles.spacer} />
      <button
        type="button"
        className={`${v6Styles.placementTrigger} ${bottomMode ? v6Styles.placementRotated : ''}`}
        aria-label={`Test alternative inventory layout. Currently inventory in ${bottomMode ? 'bottom' : 'side'} panel.`}
        title="Test alternative inventory layout"
        aria-pressed={bottomMode}
        onClick={togglePlacement}
      >
        <span className={v6Styles.placementLabel} aria-hidden>
          {bottomMode ? 'B' : 'A'}
        </span>
      </button>
      <div className={styles.avatarWrap}>
        <button
          type="button"
          className={styles.avatar}
          aria-label="Back to prototype home"
          title="Prototype home"
          onClick={() => onVersionChange?.('cover')}
        >
          <img
            src={theoBotAvatar}
            alt=""
            className={styles.avatarImage}
            width={32}
            height={32}
          />
        </button>
      </div>
    </nav>
  );
}
