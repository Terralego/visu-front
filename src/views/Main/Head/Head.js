import React from 'react';
import { Helmet } from 'react-helmet';

const Head = ({
  settings: {
    theme: {
      style,
    } = {},
    title,
  } = {},
}) => (
  <Helmet>
    <title>{title}</title>
    {style && style.map(link => <link key={link} rel="stylesheet" type="text/html" href={link} />)}
  </Helmet>
);
export default Head;
