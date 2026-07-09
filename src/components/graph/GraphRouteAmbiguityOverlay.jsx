import { ROUTE_A, ROUTE_B } from '../../data/mockData';
import { getRoutePreviewMessage } from '../../data/routeDetection';
import { RESOLUTION_PATTERN } from '../../hooks/useRouteAmbiguity';
import styles from './GraphRouteAmbiguityOverlay.module.css';

const ROUTES = [ROUTE_A, ROUTE_B];

export default function GraphRouteAmbiguityOverlay({
  pattern,
  hoverRemovedRouteId,
  onHoverRoute,
  onPruneRoute,
  onSelectRoute,
}) {
  const isPrune = pattern === RESOLUTION_PATTERN.PRUNE;

  const handlePick = (routeId) => {
    if (isPrune) {
      onPruneRoute(routeId);
    } else {
      const keepId = routeId === ROUTE_A.id ? ROUTE_A.id : ROUTE_B.id;
      onSelectRoute(keepId);
    }
  };

  return (
    <div className={styles.overlay} role="region" aria-label="Route ambiguity resolution">
      <div className={styles.alert}>
        <span className={styles.alertIcon} aria-hidden>
          ⚠
        </span>
        <div className={styles.alertText}>
          <strong>Multiple paths to Delivery Item</strong>
          <p>
            {isPrune
              ? 'Cut any highlighted link (✂) or use the route cards — each cut removes that entire path.'
              : 'Click the route you want to keep in this perspective.'}
          </p>
        </div>
      </div>

      <div className={styles.routeRow}>
        {ROUTES.map((route) => {
          const isHovered = hoverRemovedRouteId === route.id;
          const previewMsg = getRoutePreviewMessage(route.id);

          return (
            <button
              key={route.id}
              type="button"
              className={`${styles.routeBtn} ${styles[route.id]} ${isHovered ? styles.routeBtnHovered : ''}`}
              aria-label={
                isPrune
                  ? `${previewMsg}. Click to remove.`
                  : `Keep ${route.label}: ${route.description}`
              }
              onMouseEnter={() => onHoverRoute(route.id)}
              onMouseLeave={() => onHoverRoute(null)}
              onFocus={() => onHoverRoute(route.id)}
              onBlur={() => onHoverRoute(null)}
              onClick={() => handlePick(route.id)}
            >
              <span className={styles.routeBadge}>{route.label}</span>
              <span className={styles.routePath}>{route.description}</span>
              <span className={styles.routeAction}>
                {isHovered
                  ? isPrune
                    ? `Remove ${route.label}`
                    : `Keep ${route.label}`
                  : isPrune
                    ? 'Click to remove'
                    : 'Click to keep'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
