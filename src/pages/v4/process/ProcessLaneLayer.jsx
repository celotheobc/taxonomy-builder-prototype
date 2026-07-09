import { memo } from 'react';
import styles from './ProcessLaneLayer.module.css';

function ProcessLaneLayer({ data }) {
  const { lanes = [], connections = [], width = 800, height = 600 } = data;

  return (
    <div className={styles.root} style={{ width, height }} aria-hidden>
      <svg
        className={styles.svg}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {connections.map((connection) => (
          <path
            key={connection.id}
            d={connection.pathD}
            className={styles.interchange}
            fill="none"
          />
        ))}

        {lanes.map((lane) => (
          <g key={lane.objectId}>
            <path
              d={lane.pathD}
              className={styles.track}
              stroke={lane.color}
            />
            <circle
              cx={lane.endCapX}
              cy={lane.y}
              r={6}
              className={styles.endCap}
              stroke={lane.color}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default memo(ProcessLaneLayer);
