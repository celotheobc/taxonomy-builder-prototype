import { useCallback, useState } from 'react';

const SPLIT_MIN = 220;
const SPLIT_MAX = 560;
const SPLIT_DEFAULT = 300;

export function useSubtypesSplitWidth() {
  const [leftWidth, setLeftWidth] = useState(SPLIT_DEFAULT);

  const adjustLeftWidth = useCallback((delta) => {
    setLeftWidth((width) => Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, width + delta)));
  }, []);

  return { leftWidth, adjustLeftWidth };
}
