import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';

import ErrorBoundary from '../../../../components/ErrorBoundary';
import Template from '../../../Template';
import blockComponents from './blocks';
import toPreviewParts from './previewParts';

export const titleText = (title, properties = {}) => (title
  ? (title.field && properties[title.field]) || title.default || ''
  : '');

export const MinisheetHeaderTitle = ({ title, properties }) => {
  const text = titleText(title, properties);

  if (!text && !title?.icon) {
    return null;
  }

  return (
    <Typography
      component="h2"
      title={String(text)}
      sx={{ flex: 1, minWidth: 0, mx: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, fontSize: '1.2rem', fontWeight: 400, lineHeight: 1.25 }}
    >
      {title.icon && <Box component="img" src={title.icon} alt="" sx={{ height: '1.4rem', flexShrink: 0 }} />}
      <Box
        component="span"
        sx={{ minWidth: 0, textAlign: 'center', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflowWrap: 'anywhere' }}
      >
        {text}
      </Box>
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

export const Minisheet = ({ blocks = [], properties = {} }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Blocks blocks={blocks} properties={properties} />
  </Box>
);

export default Minisheet;
