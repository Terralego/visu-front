import React from 'react';
import {
  Button,
  Classes,
} from '@blueprintjs/core';
import './styles.scss';
import classnames from 'classnames';

export const HeaderButton = ({ id, iconPath, alt }) => (
  <Button
    className={`${Classes.MINIMAL} header-button`}
    minimal
    id={id}
  >
    <img src={iconPath} alt={alt} className={classnames({ icon: id !== 'welcome' })} />
  </Button>
);
export default HeaderButton;
