import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Classes,
} from '@blueprintjs/core';
import classnames from 'classnames';
import './styles.scss';

export const HeaderButton = ({ id, icon, iconPath, alt }) => (
  <Button
    className={`${Classes.MINIMAL} header-button ${id}`}
    minimal
    id={id}
  >
    <img src={iconPath} alt={alt} className={classnames({ icon })} />
  </Button>
);

HeaderButton.propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.string,
  iconPath: PropTypes.string,
  alt: PropTypes.string,
};

HeaderButton.defaultProps = {
  icon: 'icon',
  iconPath: '',
  alt: '',
};

export default HeaderButton;
