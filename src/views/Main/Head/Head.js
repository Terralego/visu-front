import React from 'react';
import { Helmet } from 'react-helmet';

const Head = ({ settings = {} }) => {
  const hasSettings  = settings.theme;
  return(
    <Helmet>
    <title>{settings.title}</title>
    {hasSettings && settings.theme.style.map(link => <link key={link} rel="stylesheet" type="text/html" href={link} />)} */}
  </Helmet>
  )
};
export default Head;
