import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import {
  Overlay,
  Classes,
} from '@blueprintjs/core';

import withDeviceSize from '@terralego/core/hoc/withDeviceSize';

import NavBarItemDesktop from './NavBarItemDesktop';
import NavBarItemTablet from './NavBarItemTablet';
import PartnerPage from './PartnerPage';

export class PartnerButton extends React.Component {
  state = {
    isOpen: false,
  };

  static propTypes = {
    isMobileSized: PropTypes.bool,
  };

  static defaultProps = {
    isMobileSized: false,
  };

  open = () => this.setState({ isOpen: true });

  close = () => this.setState({ isOpen: false });

  render () {
    const { isOpen } = this.state;
    const { isMobileSized } = this.props;
    const { open, close } = this;
    const NavBarItem = isMobileSized ? NavBarItemTablet : NavBarItemDesktop;
    return (
      <>
        <NavBarItem {...this.props} onClick={open} />
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
              Classes.CARD,
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
export default withDeviceSize()(PartnerButton);
