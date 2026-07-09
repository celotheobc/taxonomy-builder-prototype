import { getObjectType } from '../../../data/mockObjectTypes';
import SpokeGraphNode from './SpokeGraphNode';
import styles from './ObjectTypeSpokeGraph.module.css';

const CENTER = { x: 50, y: 50 };
const RADIUS = 24;

function polarToPercent(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${CENTER.x + RADIUS * Math.cos(rad)}%`,
    top: `${CENTER.y + RADIUS * Math.sin(rad)}%`,
  };
}

export default function ObjectTypeSpokeGraph({ objectTypeId }) {
  const objectType = getObjectType(objectTypeId);
  const neighbors = objectType.graphNeighbors;

  return (
    <div className={styles.wrap}>
      <div className={styles.canvas}>
        <svg className={styles.edges} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {neighbors.map((neighbor) => {
            const point = polarToPercent(neighbor.angle);
            return (
              <line
                key={neighbor.id}
                x1={CENTER.x}
                y1={CENTER.y}
                x2={parseFloat(point.left)}
                y2={parseFloat(point.top)}
                className={styles.edge}
              />
            );
          })}
        </svg>

        <div className={styles.nodeLayer}>
          <div className={`${styles.node} ${styles.hubNode}`}>
            <SpokeGraphNode label={objectType.name} kind="object" hub />
          </div>
          {neighbors.map((neighbor) => {
            const position = polarToPercent(neighbor.angle);
            return (
              <div
                key={neighbor.id}
                className={styles.node}
                style={{ left: position.left, top: position.top }}
              >
                <SpokeGraphNode label={neighbor.label} kind={neighbor.kind} />
              </div>
            );
          })}
        </div>

        <div className={styles.zoomHint} aria-hidden>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
