import React from 'react';
import classNames from 'classnames';
import {
  Overlay,
  Classes,
} from '@blueprintjs/core';

import NavBarItem from './NavBarItem';
import PartnerPage from './PartnerPage';

export class PartnerButton extends React.Component {
  state = {
    isOpen: false,
  }

  open = () => this.setState({ isOpen: true })

  close = () => this.setState({ isOpen: false })

  render () {
    const { isOpen } = this.state;
    const { open, close } = this;

    return (
      <>
        <NavBarItem
          {...this.props}
          onClick={open}
        />
        <Overlay
          className={classNames(
            Classes.OVERLAY_SCROLL_CONTAINER,
            Classes.LIGHT,
            'modal-mentions-legales',
          )}
          isOpen={isOpen}
          onClose={close}
        >
          <div
            className={classNames(
              Classes.ELEVATION_4,
            )}
          >
            <PartnerPage />
          </div>
        </Overlay>
      </>
    );
  }
}
export default PartnerButton;
