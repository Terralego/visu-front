import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Classes,
} from '@blueprintjs/core';
import classNames from 'classnames';
import './styles.scss';

export const HeaderButton = ({ id, icon, iconPath, alt, classNameIcon }) => (
  <Button
    className={classNames(
      `${Classes.MINIMAL} header-button ${id}`,
      classNameIcon === 'icon' ? 'header-button' : 'header-button__out',
    )}
    minimal
    id={id}
  >
    <img src={iconPath} alt={alt} className={classNameIcon} />
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
