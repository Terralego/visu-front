import FiltersPanelContent from './FiltersPanelContent';

import { connectView } from '../../../../context';

export default connectView(({ getLayerState }, { layer }) => ({
  filtersValues: getLayerState({ layer }).filters || {},
}))(FiltersPanelContent);
