import { connectVisualizerProvider } from '../../services/context';
import WidgetMap from './WidgetMap';

export default connectVisualizerProvider('setDetails')(WidgetMap);
