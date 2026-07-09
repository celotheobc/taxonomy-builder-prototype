import PerspectiveIcon from '../icons/PerspectiveIcon';
import styles from './ContextSidebar.module.css';

export default function ContextSidebar({
  activePerspective = 'Order to Cash Perspective',
}) {
  const tree = [
    { label: 'Objects', open: false },
    { label: 'Events', open: false },
    {
      label: 'Perspectives',
      open: true,
      children: ['Order to Cash Perspective', 'Procure to Pay'],
      active: activePerspective,
    },
    { label: 'Transformations', open: false },
  ];

  return (
    <aside className={styles.sidebar} aria-label="Context model assets">
      <input
        type="search"
        className={styles.search}
        placeholder="Search assets…"
        aria-label="Search assets"
      />
      <ul className={styles.tree}>
        {tree.map((item) => (
          <li key={item.label}>
            <span className={styles.branch}>{item.open ? '▾' : '▸'} {item.label}</span>
            {item.children && (
              <ul>
                {item.children.map((child) => (
                  <li key={child}>
                    <button
                      type="button"
                      className={
                        child === item.active ? styles.assetActive : styles.asset
                      }
                    >
                      <PerspectiveIcon size={16} className={styles.assetIcon} />
                      <span className={styles.assetLabel}>{child}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
