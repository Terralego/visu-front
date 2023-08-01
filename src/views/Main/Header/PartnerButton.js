import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import {
  Overlay,
  Classes,
} from '@blueprintjs/core';

import withDeviceSize from '@terralego/core/hoc/withDeviceSize';

import NavBarItemDesktop from '@terralego/core/components/NavBarItemDesktop';
import NavBarItemTablet from '@terralego/core/components/NavBarItemTablet';

import PartnerPage from './PartnerPage';

export const PartnerOverlayContent = ({ content, className = '' }) => (
  <div
    role="dialog"
    aria-modal="true"
    className={classNames(
      Classes.CARD,
      Classes.ELEVATION_4,
      className,
    )}
  >
    <PartnerPage content={content} />
  </div>
);

export const PartnerButton = ({ isMobileSized, isPhoneSized, content, ...props }) => {
  const [isOpen, setOpen] = React.useState(false);
  const NavBarItem = isMobileSized ? NavBarItemTablet : NavBarItemDesktop;

  return (
    <>
      <NavBarItem {...props} onClick={() => setOpen(true)} buttonProps={{ 'aria-expanded': isOpen }} />
      <Overlay
        className={classNames(
          Classes.OVERLAY_SCROLL_CONTAINER,
          Classes.LIGHT,
          'modal-mentions-legales',
        )}
        isOpen={isOpen}
        onClose={() => setOpen(false)}
      >
        <PartnerOverlayContent content={content} />
      </Overlay>
    </>
  );
};

PartnerButton.propTypes = {
  isMobileSized: PropTypes.bool,
  isPhoneSized: PropTypes.bool,
};

PartnerButton.defaultProps = {
  isMobileSized: false,
  isPhoneSized: false,
};


export default withDeviceSize()(PartnerButton);
