import React from 'react';
import { render, screen } from '@testing-library/react';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material';

import theme from '../../../../../../mui-theme';
import blockComponents from '.';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key, i18n: { language: 'fr' } }),
}));

window.matchMedia = window.matchMedia || (() => ({
  matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {},
}));

const Blocks = ({ blocks, properties }) => blocks.map(block => {
  const Component = blockComponents[block.type];
  return <Component key={block.id} block={block} properties={properties} Blocks={Blocks} />;
});

const renderBlocks = (blocks, properties = {}) => render(
  <CssVarsProvider theme={theme}>
    <Blocks blocks={blocks} properties={properties} />
  </CssVarsProvider>,
);

const condition = JSON.parse(`{
  "id": "co", "type": "condition", "when": { "field": "ouvert", "operator": "truthy" },
  "then": [{ "id": "ct", "type": "typography", "text": "Ouvert" }],
  "else": [{ "id": "ce", "type": "typography", "text": "Fermé" }]
}`);

const properties = { nom: 'Lautaret', altitude: 2058.4, ouvert: true, photo: 'https://example.org/a.jpg', hommes: 12, femmes: 30 };

describe('blocks', () => {
  it('renders every type in the colors of the theme', () => {
    renderBlocks([
      { id: 'f', type: 'field', field: 'altitude', label: 'Altitude', format: { decimals: 0 }, style: 'highlight', color: 'primary' },
      { id: 't', type: 'typography', text: 'Col du {{nom}}', icon: { value: '⛰' } },
      { id: 'c', type: 'card', border: true, background: true, accent: true, color: 'secondary', children: [
        { id: 'cf', type: 'field', field: 'nom', label: 'Nom', color: 'inherit' },
      ] },
      { id: 'a', type: 'alert', severity: 'warning', title: 'Attention', text: '{{nom}} fermé' },
      { id: 'b', type: 'button', label: 'Voir', href: 'https://example.org/{{nom}}', color: 'custom', customColor: '#ff0000' },
      { id: 'i', type: 'image', src: '{{photo}}', caption: 'Photo de {{nom}}' },
      { id: 'fr', type: 'iframe', src: 'https://example.org/embed' },
      { id: 'ac', type: 'accordion', text: 'Plus', expanded: true, children: [{ id: 'd', type: 'divider', color: 'primary' }] },
      { id: 'ch', type: 'chart', label: 'Population', graph: { type: 'pie' }, series: [{ field: 'hommes', label: 'Hommes' }, { field: 'femmes', label: 'Femmes' }] },
      { id: 'r', type: 'repeat', direction: 'horizontal', columns: 2, fields: [{ field: 'nom', label: 'Nom' }, { field: 'absent' }], children: [{ id: 'rf', type: 'field' }] },
      condition,
    ], properties);

    expect(screen.getByText('2 058')).toBeTruthy();
    expect(screen.getByText('Col du Lautaret')).toBeTruthy();
    expect(screen.getAllByText('Lautaret')).toHaveLength(2);
    expect(screen.getByText('Lautaret fermé')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Voir' }).getAttribute('href')).toBe('https://example.org/Lautaret');
    expect(screen.getByText('Photo de Lautaret')).toBeTruthy();
    expect(screen.getByText('Ouvert')).toBeTruthy();
    expect(screen.queryByText('Fermé')).toBeNull();
    expect(screen.getByText('Population')).toBeTruthy();
  });

  it('says a chart has no data rather than drawing an empty one', () => {
    renderBlocks([{ id: 'ch', type: 'chart', graph: { type: 'bars' }, series: [{ field: 'absent' }] }]);

    expect(screen.getByText('terralego.visualizer.minisheet.no_data')).toBeTruthy();
  });
});
