import { connectMain } from '../Provider/context';

import Header from './Header';

export default connectMain('isHeaderOpen', 'toggleHeader')(Header);
