import { connectSettings } from '../Provider/context';
import withEnv from '../../../config/withEnv';

import Header from './Header';

export default withEnv(connectSettings('settings')(Header));
