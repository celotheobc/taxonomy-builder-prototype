export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Animate node positions from current state toward targets.
 * Returns a promise that resolves when complete.
 */
export function animateNodesToTargets(currentNodes, targetNodes, setNodes, duration = 480) {
  if (!targetNodes.length) {
    setNodes([]);
    return Promise.resolve();
  }

  const from = Object.fromEntries(
    currentNodes.map((n) => [n.id, { ...n.position }]),
  );
  const targetsById = Object.fromEntries(targetNodes.map((n) => [n.id, n]));

  if (currentNodes.length === 0) {
    setNodes(targetNodes);
    return Promise.resolve();
  }

  const start = performance.now();

  return new Promise((resolve) => {
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const e = easeInOutCubic(t);

      setNodes((prev) =>
        prev.map((n) => {
          const target = targetsById[n.id];
          if (!target) return n;
          const origin = from[n.id] ?? n.position;
          return {
            ...target,
            position: {
              x: origin.x + (target.position.x - origin.x) * e,
              y: origin.y + (target.position.y - origin.y) * e,
            },
          };
        }),
      );

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        setNodes(targetNodes);
        resolve();
      }
    }
    requestAnimationFrame(tick);
  });
}
