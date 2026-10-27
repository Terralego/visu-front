import React from 'react';
import { render, screen } from '@testing-library/react';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material';

import theme from '../../../../mui-theme';
import Details from './Details';
import buildMinisheetFixture from './Minisheet/testFixture';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key, i18n: { language: 'fr' } }),
}));

vi.mock('../../Template', async () => {
  const { default: nunjucks } = await import('nunjucks');
  const { default: marked } = await import('marked');
  const env = new nunjucks.Environment();
  const Template = ({ template, ...props }) => (
    <div dangerouslySetInnerHTML={{ __html: marked(env.renderString(template, props)) }} />
  );
  return { default: Template };
});

vi.mock('./ReportsIndicator', () => ({ default: () => null }));
vi.mock('../../../components/LoginButton', () => ({ default: () => null }));

window.matchMedia = window.matchMedia || (() => ({
  matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {},
}));

const properties = { _id: 1, nom: 'Lautaret', altitude: 2058, surface: 12.5 };

const renderDetails = interaction => render(
  <CssVarsProvider theme={theme}>
    <Details visible feature={{ properties }} interaction={interaction} />
  </CssVarsProvider>,
);

describe('Details', () => {
  it('renders every block type of an interaction with blocks, instead of its template', () => {
    const { container } = renderDetails({ template: '<p class="old">ancien</p>', ...buildMinisheetFixture(properties) });

    expect(container.querySelector('.old')).toBeNull();
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Lautaret');
    expect(container.querySelectorAll('.details')).toHaveLength(1);
    expect(container.querySelector('.details').textContent).toContain('2058');
    expect(screen.getByText('Typographie : Lautaret')).toBeTruthy();
    expect(screen.getByText('valeur par défaut')).toBeTruthy();
    expect(screen.getByText('Texte hérité de la carte')).toBeTruthy();
    expect(screen.getByText('Barres')).toBeTruthy();
    expect(screen.getByText('Camembert')).toBeTruthy();
    expect(screen.getByText('terralego.visualizer.minisheet.no_data')).toBeTruthy();
    expect(screen.getByText('Accordéon')).toBeTruthy();
    expect(screen.getByText('altitude > 0')).toBeTruthy();
    expect(screen.queryByText('altitude ≤ 0 ou absent')).toBeNull();
    expect(screen.getByRole('link', { name: /OpenStreetMap/ }).getAttribute('href'))
      .toBe('https://www.openstreetmap.org/search?query=Lautaret');
    expect(screen.getByText('Image de Lautaret')).toBeTruthy();
    expect(container.querySelector('iframe')).toBeTruthy();
    expect(screen.getByText(/: LAUTARET/)).toBeTruthy();
  });

  it('keeps the template rendering when the interaction has no blocks', () => {
    const { container } = renderDetails({ template: '<p class="old">{{ nom }}</p>' });

    expect(container.querySelector('.old').textContent).toBe('Lautaret');
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
  });

  it('shows nothing from the template when blocks is an empty list', () => {
    const { container } = renderDetails({ template: '<p class="old">ancien</p>', blocks: [], title: null });

    expect(container.querySelector('.old')).toBeNull();
  });
});
