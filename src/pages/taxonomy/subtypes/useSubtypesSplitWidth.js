import { useCallback, useState } from 'react';

const SPLIT_MIN = 240;
const SPLIT_MAX = 560;
const SPLIT_DEFAULT = 320;

export function useSubtypesSplitWidth() {
  const [leftWidth, setLeftWidth] = useState(SPLIT_DEFAULT);

  const adjustLeftWidth = useCallback((delta) => {
    setLeftWidth((width) => Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, width + delta)));
  }, []);

  return { leftWidth, adjustLeftWidth };
}
