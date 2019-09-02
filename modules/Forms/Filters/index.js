import { connectLayersTree } from '../../Visualizer/LayersTree/LayersTreeProvider/context';
import Filters from './Filters';

export { TYPE_SINGLE, TYPE_MANY, TYPE_RANGE, TYPE_BOOL } from './Filters';
export default connectLayersTree('translate')(Filters);
