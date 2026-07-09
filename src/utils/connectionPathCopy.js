export const CONNECTION_PATH_COPY = {
  eyebrow: 'Choose connection',
  panelHint(addedName) {
    return `Each path adds ${addedName} and any objects marked with +. Hover to preview on the graph, then pick an option below.`;
  },
  chooseButton: 'Add with this path',
  addsObjects(count) {
    return count === 1 ? 'Adds 1 object' : `Adds ${count} objects`;
  },
  canvasTitle(pathCount, objectName) {
    const ways = pathCount === 1 ? '1 way' : `${pathCount} ways`;
    return `${ways} to add ${objectName}`;
  },
  canvasMessage:
    'Connecting this object requires adding additional objects. Choose an option in the panel on the right.',
};

export function countObjectsToAdd(objectIds, includedObjects) {
  return objectIds.filter((id) => !includedObjects.has(id)).length;
}
