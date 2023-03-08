import React from 'react';

export const Spinner = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
Spinner.displayName = 'Spinner';

export const H1 = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
H1.displayName = 'H1';

export const Card = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
Card.displayName = 'Card';

export const Button = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
Button.displayName = 'Button';

export const Toaster = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
Toaster.displayName = 'Toaster';

export const FormGroup = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
FormGroup.displayName = 'FormGroup';

export const InputGroup = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
InputGroup.displayName = 'InputGroup';

export const Icon = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
Icon.displayName = 'Icon';

export const Overlay = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
Overlay.displayName = 'Overlay';

export const Tag = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
Tag.displayName = 'Tag';

export const Popover = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
Popover.displayName = 'Popover';

export const AnchorButton = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
AnchorButton.displayName = 'AnchorButton';

export const Menu = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
Menu.displayName = 'Menu';

export const Classes = {
  OVERLAY_SCROLL_CONTAINER: 'OVERLAY_SCROLL_CONTAINER',
  LIGHT: 'LIGHT',
  CARD: 'CARD',
  ELEVATION_4: 'ELEVATION_4',
};

export const Intent = {
  DANGER: 'DANGER',
  PRIMARY: 'PRIMARY',
};

export const Position = {
  LEFT: 'LEFT',
};

export const PopoverInteractionKind = {
  HOVER: 'HOVER',
};


export default {};
