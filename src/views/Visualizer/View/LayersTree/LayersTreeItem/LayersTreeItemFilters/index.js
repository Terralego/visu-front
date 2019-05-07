import LayersTreeItemFilters from './LayersTreeItemFilters';
import { connectView } from '../../../context';

export default connectView(({ getLayerState, setLayerState }, { layer }) => ({
  filtersValues: getLayerState({ layer }).filters || {},
  setLayerState,
}))(LayersTreeItemFilters);
