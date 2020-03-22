import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Classes,
} from '@blueprintjs/core';
import classNames from 'classnames';
import './styles.scss';

export const HeaderButton = ({ id, iconPath, alt, classNameIcon }) => (
  <Button
    className={classNames(
      `${Classes.MINIMAL} header-button ${id}`,
      classNameIcon === 'icon_out' ? 'header-button__out' : 'header-button',
    )}
    minimal
    id={id}
  >
    <img src={iconPath} alt={alt} className={classNameIcon} />
  </Button>
);

HeaderButton.propTypes = {
  id: PropTypes.string.isRequired,
  iconPath: PropTypes.string,
  alt: PropTypes.string,
};

HeaderButton.defaultProps = {
  iconPath: '',
  alt: '',
};

export default HeaderButton;
