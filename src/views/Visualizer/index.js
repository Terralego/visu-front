import { withRouter } from 'react-router-dom';

import Visualizer from './Visualizer';
import withEnv from '../../config/withEnv';

export default withRouter(withEnv(Visualizer));
