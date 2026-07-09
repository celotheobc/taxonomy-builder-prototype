import { ROUTE_A, ROUTE_B } from '../../data/mockData';
import styles from './RouteAmbiguityPanel.module.css';

export default function RouteAmbiguityPanel({
  isResolved,
  activeRouteId,
  pattern,
  onSelectRoute,
}) {
  if (isResolved) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.warning}>
        <span className={styles.warningIcon} aria-hidden>
          ⚠
        </span>
        <div>
          <strong>Delivery Item can be reached through more than one route.</strong>
          <p>Choose the route this Perspective should use.</p>
        </div>
      </div>

      <div className={styles.routes}>
        <div className={`${styles.routeCard} ${styles.routeA}`}>
          <span className={styles.routeBadge}>Route A</span>
          <p className={styles.path}>{ROUTE_A.description}</p>
          {pattern === 'select' && (
            <button
              type="button"
              className={styles.keepBtn}
              onClick={() => onSelectRoute(ROUTE_A.id)}
            >
              Keep this route
            </button>
          )}
        </div>
        <div className={`${styles.routeCard} ${styles.routeB}`}>
          <span className={styles.routeBadge}>Route B</span>
          <p className={styles.path}>{ROUTE_B.description}</p>
          {pattern === 'select' && (
            <button
              type="button"
              className={styles.keepBtn}
              onClick={() => onSelectRoute(ROUTE_B.id)}
            >
              Keep this route
            </button>
          )}
        </div>
      </div>

      {pattern === 'prune' && (
        <p className={styles.hint}>
          Hover ✂ on a conflicting relationship to preview what would be removed, then
          click to prune that route from the graph.
        </p>
      )}

      {activeRouteId && (
        <p className={styles.resolvedNote}>
          Active route: {activeRouteId === ROUTE_A.id ? ROUTE_A.description : ROUTE_B.description}
        </p>
      )}
    </div>
  );
}
