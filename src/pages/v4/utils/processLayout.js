import { eventLinks, relationships } from '../../../data/mockData';

const OBJECT_NODE_WIDTH = 100;
const OBJECT_MARKER_SIZE = 52;
const OBJECT_MARKER_RADIUS = OBJECT_MARKER_SIZE / 2;
const EVENT_NODE_WIDTH = 72;
const EVENT_STATION_SIZE = 34;
const EVENT_STATION_RADIUS = EVENT_STATION_SIZE / 2;

const LANE_START_X = 56;
const OBJECT_NODE_X = LANE_START_X - OBJECT_NODE_WIDTH / 2;
const LANE_TRACK_START_X = LANE_START_X + OBJECT_MARKER_RADIUS;
const LANE_EVENT_START_X = 220;
const EVENT_STEP_X = 148;
const LANE_BASE_Y = 88;
const LANE_STEP_Y = 112;
const LANE_MIN_END_X = 560;
const INTERCHANGE_BUS_OFFSET = 36;

/** Process-flow ordering for lane stacking */
const PROCESS_OBJECT_ORDER = {
  customer: 0,
  'sales-order': 1,
  'sales-order-item': 2,
  delivery: 3,
  'delivery-item': 4,
  invoice: 5,
  'invoice-item': 6,
  product: 7,
  material: 8,
  plant: 9,
  'vendor-hub': 10,
  'returns-processing': 11,
};

const LANE_COLORS = [
  '#3b82f6',
  '#0d9488',
  '#6366f1',
  '#d97706',
  '#db2777',
  '#0891b2',
  '#64748b',
  '#65a30d',
];

function sortObjectIds(objectIds) {
  return [...objectIds].sort(
    (a, b) => (PROCESS_OBJECT_ORDER[a] ?? 99) - (PROCESS_OBJECT_ORDER[b] ?? 99),
  );
}

function groupEventsByObject(objectIds, eventIds) {
  const map = Object.fromEntries(objectIds.map((id) => [id, []]));
  for (const link of eventLinks) {
    if (eventIds.includes(link.eventId) && objectIds.includes(link.objectId)) {
      map[link.objectId].push(link.eventId);
    }
  }
  for (const oid of Object.keys(map)) {
    map[oid].sort((a, b) => eventIds.indexOf(a) - eventIds.indexOf(b));
  }
  return map;
}

function buildLanePath(x1, y, x2) {
  return `M ${x1} ${y} L ${x2} ${y}`;
}

function buildInterchangePath(sourceLane, targetLane, busX) {
  const x1 = sourceLane.endCapX;
  const y1 = sourceLane.y;
  const x2 = targetLane.endCapX;
  const y2 = targetLane.y;
  return `M ${x1} ${y1} L ${busX} ${y1} L ${busX} ${y2} L ${x2} ${y2}`;
}

/**
 * Tube-map layout: each object is a horizontal lane; events sit as stations on their lane.
 */
export function computeProcessLaneLayout(objectIds, eventIds) {
  const sortedObjects = sortObjectIds(objectIds);
  const eventsByObject = groupEventsByObject(objectIds, eventIds);
  const lanes = [];
  const positions = {};
  let maxEndX = LANE_MIN_END_X;

  sortedObjects.forEach((objectId, laneIndex) => {
    const y = LANE_BASE_Y + laneIndex * LANE_STEP_Y;
    const laneEvents = eventsByObject[objectId] ?? [];
    const endX = Math.max(
      LANE_MIN_END_X,
      laneEvents.length > 0
        ? LANE_EVENT_START_X + (laneEvents.length - 1) * EVENT_STEP_X + 100
        : LANE_MIN_END_X,
    );
    maxEndX = Math.max(maxEndX, endX);

    positions[objectId] = {
      x: OBJECT_NODE_X,
      y: y - OBJECT_MARKER_RADIUS,
      role: 'object',
      laneY: y,
    };

    laneEvents.forEach((eventId, index) => {
      const eventX = LANE_EVENT_START_X + index * EVENT_STEP_X;
      positions[eventId] = {
        x: eventX - EVENT_NODE_WIDTH / 2,
        y: y - EVENT_STATION_RADIUS,
        role: 'event',
        laneObjectId: objectId,
        laneY: y,
      };
    });

    lanes.push({
      objectId,
      y,
      startX: LANE_TRACK_START_X,
      endX,
      endCapX: endX + 8,
      pathD: buildLanePath(LANE_TRACK_START_X, y, endX),
      color: LANE_COLORS[laneIndex % LANE_COLORS.length],
      eventIds: laneEvents,
    });
  });

  const interchangeBusX = maxEndX + INTERCHANGE_BUS_OFFSET;
  const laneByObject = Object.fromEntries(lanes.map((lane) => [lane.objectId, lane]));
  const connections = [];
  const objectSet = new Set(objectIds);

  for (const rel of relationships) {
    if (!objectSet.has(rel.source) || !objectSet.has(rel.target)) continue;
    const sourceLane = laneByObject[rel.source];
    const targetLane = laneByObject[rel.target];
    if (!sourceLane || !targetLane || sourceLane.objectId === targetLane.objectId) continue;
    connections.push({
      id: rel.id,
      pathD: buildInterchangePath(sourceLane, targetLane, interchangeBusX),
      sourceObjectId: rel.source,
      targetObjectId: rel.target,
    });
  }

  return {
    lanes,
    positions,
    connections,
    width: interchangeBusX + 48,
    height: LANE_BASE_Y + sortedObjects.length * LANE_STEP_Y + 80,
  };
}

/** @deprecated Use computeProcessLaneLayout */
export function computeProcessPositions(objectIds, eventIds) {
  return computeProcessLaneLayout(objectIds, eventIds).positions;
}
