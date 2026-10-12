import FiltersPanel from './FiltersPanel';

import { connectLayersTree } from '../../LayersTreeProvider/context';

export default connectLayersTree(({ setLayerState, searchPropertyValues }) => ({
  setLayerState,
  searchPropertyValues,
}))(FiltersPanel);
