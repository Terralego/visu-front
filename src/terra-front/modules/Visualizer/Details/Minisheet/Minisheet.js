import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';

import ErrorBoundary from '../../../../components/ErrorBoundary';
import Template from '../../../Template';
import blockComponents from './blocks';
import toPreviewParts from './previewParts';

const Title = ({ title, properties }) => {
  if (!title) {
    return null;
  }
  const text = (title.field && properties[title.field]) || title.default;

  return (
    <Typography
      component="h2"
      sx={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}
    >
      {title.icon && <Box component="img" src={title.icon} alt="" sx={{ height: '1.6rem' }} />}
      {text}
    </Typography>
  );
};

const BlockPart = ({ block, properties }) => {
  const Component = blockComponents[block.type];

  if (!Component) {
    return null;
  }
  // eslint-disable-next-line no-use-before-define
  return <Component block={block} properties={properties} Blocks={Blocks} />;
};

const NunjucksPart = ({ template, properties }) => {
  const { t } = useTranslation();

  return (
    <ErrorBoundary errorMsg={t('terralego.map.template.render.error')}>
      <Template {...properties} template={template} />
    </ErrorBoundary>
  );
};

const Blocks = ({ blocks, properties }) => toPreviewParts(blocks).map(part => (part.kind === 'nunjucks'
  ? <NunjucksPart key={part.key} template={part.template} properties={properties} />
  : <BlockPart key={part.key} block={part.block} properties={properties} />));

export const Minisheet = ({ title, blocks = [], properties = {} }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Title title={title} properties={properties} />
    <Blocks blocks={blocks} properties={properties} />
  </Box>
);

export default Minisheet;
