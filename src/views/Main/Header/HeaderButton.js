import React from 'react';
import { Button, Classes } from '@blueprintjs/core';
import './styles.scss';

export const HeaderButton = ({ id, iconPath, alt }) => (
  <Button
    className={`${Classes.MINIMAL} header-button`}
    minimal
    id={id}
  >
    <img src={iconPath} alt={alt} className="icon" />
  </Button>
);
export default HeaderButton;
