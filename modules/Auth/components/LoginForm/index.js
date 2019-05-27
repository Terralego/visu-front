import LoginForm from './LoginForm';
import { connectTerraFrontProvider } from '../../../TerraFrontProvider';
import { connectAuthProvider } from '../../services/context';

export default connectTerraFrontProvider({
  '*': 'modules.Auth.components.LoginForm',
})(connectAuthProvider('authAction')(LoginForm));
