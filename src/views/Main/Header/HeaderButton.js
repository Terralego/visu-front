import React from 'react';
import {
  Button,
  Classes,
} from '@blueprintjs/core';
import classnames from 'classnames';
import './styles.scss';

export const HeaderButton = ({ id, icon = 'icon', iconPath, alt }) => (
  <Button
    className={`${Classes.MINIMAL} header-button`}
    minimal
    id={id}
  >
    <img src={iconPath} alt={alt} className={classnames({ icon })} />
  </Button>
);
export default HeaderButton;
