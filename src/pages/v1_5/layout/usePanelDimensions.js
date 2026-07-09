import { useCallback, useState } from 'react';

const RIGHT_MIN = 240;
const RIGHT_MAX = 520;
const RIGHT_DEFAULT = 300;
const BOTTOM_MIN = 120;
const BOTTOM_MAX = 480;
const BOTTOM_DEFAULT = 220;

export function usePanelDimensions() {
  const [rightWidth, setRightWidth] = useState(RIGHT_DEFAULT);
  const [bottomHeight, setBottomHeight] = useState(BOTTOM_DEFAULT);

  const adjustRightWidth = useCallback((delta) => {
    setRightWidth((w) => Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, w + delta)));
  }, []);

  const adjustBottomHeight = useCallback((delta) => {
    setBottomHeight((h) => Math.min(BOTTOM_MAX, Math.max(BOTTOM_MIN, h + delta)));
  }, []);

  return {
    rightWidth,
    bottomHeight,
    adjustRightWidth,
    adjustBottomHeight,
  };
}
