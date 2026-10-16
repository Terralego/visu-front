import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import {
  Overlay,
  Classes,
  Button,
} from '@blueprintjs/core';

import { SidebarItem } from '../../../components/Sidebar';

import PartnerPage from './PartnerPage';

export const PartnerOverlayContent = ({
  content,
  className = '',
  component: Component = 'aside',
  onClose: handleCloseButtonClick = () => {},
  ...props
}) => (
  <Component
    role="dialog"
    aria-modal="true"
    className={classNames(
      Classes.CARD,
      Classes.ELEVATION_4,
      className,
    )}
    {...props}
  >
    <PartnerPage content={content} />

    <Button
      aria-label="Fermer"
      className="close-overlay"
      style={{ position: 'absolute', right: 0, top: 0 }}
      icon="cross"
      onClick={handleCloseButtonClick}
      minimal
    />
  </Component>
);

export const PartnerButton = ({ content, ...props }) => {
  const [isOpen, setOpen] = React.useState(false);

  return (
    <>
      <SidebarItem {...props} onClick={() => setOpen(true)} aria-expanded={isOpen} />
      <Overlay
        className={classNames(
          Classes.OVERLAY_SCROLL_CONTAINER,
          Classes.LIGHT,
          'modal-mentions-legales',
        )}
        isOpen={isOpen}
        onClose={() => setOpen(false)}
      >
        <PartnerOverlayContent
          content={content}
          onClose={() => setOpen(false)}
        />
      </Overlay>
    </>
  );
};

PartnerButton.propTypes = {
  content: PropTypes.string,
};

PartnerButton.defaultProps = {
  content: undefined,
};

export default PartnerButton;
