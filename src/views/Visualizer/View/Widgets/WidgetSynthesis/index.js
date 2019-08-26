import WidgetSynthesis from './WidgetSynthesis';

import { connectView } from '../../context';

export default connectView('query', 'map', 'visibleBoundingBox')(WidgetSynthesis);
