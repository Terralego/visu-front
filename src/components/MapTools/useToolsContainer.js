import { useEffect, useState } from 'react';

import MapToolsControl from './MapToolsControl';

const useToolsContainer = (map, position = 'top-right', className = 'map-tools') => {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    if (!map) return undefined;

    const control = new MapToolsControl(className);
    map.addControl(control, position);
    setContainer(control.container);

    return () => {
      setContainer(null);
      try {
        map.removeControl(control);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.debug('Map tools control already removed:', error);
      }
    };
  }, [map, position, className]);

  return container;
};

export default useToolsContainer;
