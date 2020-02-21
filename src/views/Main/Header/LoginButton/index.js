import compose from '@terralego/core/utils/compose';
import withDeviceSize from '@terralego/core/hoc/withDeviceSize';
import { withTranslation } from 'react-i18next';
import { connectAuthProvider } from '@terralego/core/modules/Auth';

import LoginButton from './LoginButton';

export default compose(
  withDeviceSize(),
  withTranslation(),
  connectAuthProvider('authenticated', 'logoutAction'),
)(LoginButton);
