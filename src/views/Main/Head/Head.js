import React from 'react';
import { Helmet } from 'react-helmet';

const Head = ({
  settings: {
    theme: {
      styles,
    } = {},
    title,
  } = {},
}) => (
  <Helmet>
    <title>{title}</title>
    {styles && styles.map(link => <link key={link} rel="stylesheet" type="text/css" href={link} />)}
  </Helmet>
);
export default Head;
