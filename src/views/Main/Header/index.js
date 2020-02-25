import { connectMain, connectSettings } from '../Provider/context';

import Header from './Header';

export default connectMain('isHeaderOpen', 'toggleHeader')(connectSettings('settings')(Header));
