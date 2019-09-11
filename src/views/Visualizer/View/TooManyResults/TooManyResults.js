import React from 'react';
import { Callout } from '@blueprintjs/core';

import { MAX_SIZE } from '@terralego/core/modules/Visualizer/services/search';

import './styles.scss';

export default ({ count }) => count >= MAX_SIZE && (
  <Callout className="too-many-results">
    Votre recherche contient trop de résultats,
    veuillez affiner votre requête ou zoomer sur une zone plus restreinte.
  </Callout>
);
