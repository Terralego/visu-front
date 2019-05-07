import FiltersPanel from './FiltersPanel';

import { connectView } from '../../../context';

export default connectView(({ setLayerState }) => ({
  setLayerState,
}))(FiltersPanel);
