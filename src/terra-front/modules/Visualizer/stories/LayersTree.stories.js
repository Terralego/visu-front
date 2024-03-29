import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { object } from '@storybook/addon-knobs';

import LayersTreeProvider from '../LayersTree/LayersTreeProvider';
import LayersTreeSingle, { LayersTree as ConnectedLayersTree, connectLayersTree } from '../LayersTree';
import LayersTree from '../LayersTree/LayersTree';
import layersTreeConfig, { storyLayersTreeConfig } from './layersTree';
import Story from '../Story/Story';
import { layersTreeToStory } from '../services/layersTreeUtils';

const stories = storiesOf('Components/LayersTree', module);

const knobsOptions = {
  knobs: {
    timestamps: true, // Doesn't emit events while user is typing.
    escapeHTML: false,
  },
};

LayersTreeSingle.displayName = 'LayersTree';
LayersTree.displayName = 'LayersTree';

const onChange = layersTreeState => {
  const title = 'Update LayersTree state';
  // eslint-disable-next-line no-console
  console.log(title, layersTreeState);
  action(title)(Array.from(layersTreeState));
};

const waitForIt = timeout => new Promise(resolve => setTimeout(resolve, timeout));

const fetchPropertyValues = async (layer, { property }) => {
  // eslint-disable-next-line no-console
  console.log(`fetching property ${property} Values`);
  await waitForIt(2000);
  return Array.from(new Array(42), (v, k) => `${k}`);
};

const fetchPropertyRange = async (layer, { property }) => {
  // eslint-disable-next-line no-console
  console.log(`fetching property ${property} Values`);
  await waitForIt(2000);
  return { min: 42, max: 4200 };
};


stories.add('LayersTree', () => (
  <div style={{ maxWidth: '20rem' }}>
    <div>
      <LayersTreeSingle
        onChange={onChange}
        layersTree={object('layersTree', layersTreeConfig)}
        fetchPropertyValues={fetchPropertyValues}
        fetchPropertyRange={fetchPropertyRange}
      />
    </div>
  </div>
), {
  info: {
    propTables: [LayersTreeProvider],
    propTablesExclude: [LayersTreeSingle],
  },
});

stories.add('Storytelling', () => (
  <div style={{ maxWidth: '20rem' }}>
    <Story story={layersTreeToStory(object('storyLayersTreeConfig', storyLayersTreeConfig))} />
  </div>
), knobsOptions);

stories.add('Storytelling with std LayersTree', () => (
  <div style={{ maxWidth: '20rem' }}>
    <Story story={layersTreeToStory(object('layersTreeConfig', layersTreeConfig))} />
  </div>
), knobsOptions);

const Debug = connectLayersTree('layersTreeState')(({ layersTreeState }) => (
  <pre>{JSON.stringify(Array.from(layersTreeState), null, 2)}</pre>
));
Debug.displayName = 'connect(\'layersTreeState\')(Debug)';

stories.add('LayersTreeProvider', () => (
  <LayersTreeProvider
    layersTree={object('layersTree', layersTreeConfig)}
    fetchPropertyValues={fetchPropertyValues}
    fetchPropertyRange={fetchPropertyRange}
  >
    <div style={{
      display: 'flex',
      maxHeight: '100%',
    }}
    >
      <div style={{
        flex: 1,
        maxWidth: '30rem',
      }}
      >
        <ConnectedLayersTree />
      </div>
      <div style={{
        maxHeight: '100vh',
        overflow: 'auto',
      }}
      >
        <Debug />
      </div>
    </div>
  </LayersTreeProvider>
), {
  info: {
    propTables: [LayersTreeProvider, LayersTree],
    propTablesExclude: [Debug],
  },
});
