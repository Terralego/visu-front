import React from 'react';
import { NavLink } from 'react-router-dom';

export const HeaderLink = ({ href, children, ...props }) => {
  if (!href) return <span {...props}>{children}</span>;

  if (href.match(/^http/)) return <a href={href} {...props}>{children}</a>;

  return (
    <NavLink to={href} {...props}>{children}</NavLink>
  );
};

export default HeaderLink;
