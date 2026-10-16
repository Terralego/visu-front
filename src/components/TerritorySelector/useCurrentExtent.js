import { useEffect, useMemo, useState } from 'react';

import { findExtentAtCenter } from './extentUtils';

const useCurrentExtent = (map, extents) => {
  const [currentId, setCurrentId] = useState(extents[0]?.id);

  useEffect(() => {
    if (!map || !extents.length) return undefined;

    const syncCurrentExtent = () => {
      const extent = findExtentAtCenter(extents, map.getCenter());
      if (extent) setCurrentId(extent.id);
    };

    syncCurrentExtent();
    map.on('moveend', syncCurrentExtent);

    return () => {
      map.off('moveend', syncCurrentExtent);
    };
  }, [map, extents]);

  const current = useMemo(
    () => extents.find(({ id }) => id === currentId) || extents[0],
    [extents, currentId],
  );

  return [current, setCurrentId];
};

export default useCurrentExtent;
