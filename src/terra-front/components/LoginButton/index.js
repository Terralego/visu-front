import { connectAuthProvider } from '../../modules/Auth';

import LoginButton from './LoginButton';

export default connectAuthProvider('authenticated', 'logoutAction')(LoginButton);
