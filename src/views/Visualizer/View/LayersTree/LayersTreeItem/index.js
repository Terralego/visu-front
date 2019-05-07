import { connectAuthProvider } from '@terralego/core/modules/Auth';
import LayersTreeItem from './LayersTreeItem';
import { connectView } from '../../context';

export default connectAuthProvider('authenticated')(connectView(({ getLayerState, setLayerState }, { layer }) => {
  const {
    active: isActive,
    opacity,
    table: isTableActive,
    filters: filtersValues = {},
    widgets = [],
    total,
  } = getLayerState({ layer });
  return {
    isActive,
    opacity,
    isTableActive,
    filtersValues,
    widgets,
    setLayerState,
    total,
  };
})(LayersTreeItem));
