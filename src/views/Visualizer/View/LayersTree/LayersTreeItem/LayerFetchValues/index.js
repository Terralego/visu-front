import LayerFetchValues from './LayerFetchValues';
import { connectView } from '../../../context';

export default connectView('fetchPropertyValues', 'fetchPropertyRange')(LayerFetchValues);
