import LayersTreeSubItemsList from './LayersTreeSubItemsList';
import { connectView } from '../../../context';

export default connectView(({ selectSublayer, getLayerState }, { layer }) => ({
  layerState: getLayerState({ layer }),
  selectSublayer,
}))(LayersTreeSubItemsList);
