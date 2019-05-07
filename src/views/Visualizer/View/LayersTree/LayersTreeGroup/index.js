import { connectAuthProvider } from '@terralego/core/modules/Auth';

import LayersTreeGroup from './LayersTreeGroup';

export default connectAuthProvider('authenticated')(LayersTreeGroup);
