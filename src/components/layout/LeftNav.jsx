import PerspectiveIcon from '../icons/PerspectiveIcon';
import PrototypeVersionPicker from './PrototypeVersionNav';
import styles from './LeftNav.module.css';

const icons = [
  { type: 'text', value: '⌂' },
  { type: 'perspective' },
  { type: 'text', value: '▣' },
  { type: 'text', value: '◎' },
  { type: 'text', value: '⇄' },
  { type: 'text', value: '⚙' },
];

export default function LeftNav({ prototypeVersion, onVersionChange }) {
  return (
    <nav className={styles.nav} aria-label="Application">
      <div className={styles.logo}>C</div>
      {icons.map((icon, i) => (
        <button
          key={icon.type === 'perspective' ? 'perspective' : icon.value}
          type="button"
          className={i === 1 ? styles.active : ''}
          aria-label={`Nav ${i}`}
        >
          {icon.type === 'perspective' ? (
            <PerspectiveIcon size={18} className={styles.navIcon} />
          ) : (
            icon.value
          )}
        </button>
      ))}
      <div className={styles.spacer} />
      {prototypeVersion && onVersionChange && (
        <PrototypeVersionPicker
          version={prototypeVersion}
          onVersionChange={onVersionChange}
        />
      )}
      <button type="button" className={styles.avatar} aria-label="Profile">
        HM
      </button>
    </nav>
  );
}
