import React from 'react';
import { render, screen } from '@testing-library/react';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material';

import theme from '../../../../../mui-theme';
import Minisheet from './Minisheet';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key, i18n: { language: 'fr' } }),
}));

vi.mock('../../../Template', async () => {
  const { default: nunjucks } = await import('nunjucks');
  const { default: slugify } = await import('slugify');
  const { default: marked } = await import('marked');
  const env = new nunjucks.Environment();
  env.addFilter('slug', value => slugify(`${value || ''}`.toLowerCase()));
  const Template = ({ template, ...props }) => (
    <div dangerouslySetInnerHTML={{ __html: marked(env.renderString(template, props)) }} />
  );
  return { default: Template };
});

window.matchMedia = window.matchMedia || (() => ({
  matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {},
}));

const properties = { nom: 'Lautaret', altitude: 2058 };

const renderMinisheet = props => render(
  <CssVarsProvider theme={theme}>
    <Minisheet properties={properties} {...props} />
  </CssVarsProvider>,
);

describe('Minisheet', () => {
  it('shows the title from its field, its default otherwise', () => {
    const { rerender } = renderMinisheet({ title: { field: 'nom', default: 'Sans nom', icon: 'icon.svg' } });

    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Lautaret');
    expect(document.querySelector('img').getAttribute('src')).toBe('icon.svg');

    rerender(
      <CssVarsProvider theme={theme}>
        <Minisheet properties={properties} title={{ field: 'absent', default: 'Sans nom' }} />
      </CssVarsProvider>,
    );

    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Sans nom');
  });

  it('shows no title when it is null', () => {
    renderMinisheet({ title: null });

    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('wraps consecutive Legacy blocks in one details envelope and renders Nunjucks with the properties', () => {
    const { container } = renderMinisheet({
      blocks: [
        { id: 'a', type: 'legacy-field', template: '<p>{{ nom }}</p>' },
        { id: 'b', type: 'legacy-field', template: '<p>{{ altitude }} m</p>' },
        { id: 'e', type: 'expert', template: '<p class="expert">{{ nom | slug }}</p>' },
      ],
    });

    const envelopes = container.querySelectorAll('.details');
    expect(envelopes).toHaveLength(1);
    expect(envelopes[0].textContent).toContain('Lautaret');
    expect(envelopes[0].textContent).toContain('2058 m');
    expect(container.querySelector('.expert').textContent).toBe('lautaret');
  });

  it('renders React blocks in order and ignores unknown types', () => {
    const { container } = renderMinisheet({
      blocks: [
        { id: 'f', type: 'field', field: 'nom', label: 'Nom' },
        { id: 'x', type: 'booleans' },
        { id: 't', type: 'typography', text: 'Col du {{nom}}' },
      ],
    });

    expect(screen.getByText('Col du Lautaret')).toBeTruthy();
    expect(screen.getByText('Nom')).toBeTruthy();
    expect(container.textContent.indexOf('Nom')).toBeLessThan(container.textContent.indexOf('Col du'));
  });

  it('shows the render error message when a template fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderMinisheet({ blocks: [{ id: 'e', type: 'expert', template: '{{ nom | unknownFilter }}' }] });

    expect(screen.getByText('terralego.map.template.render.error')).toBeTruthy();
    console.error.mockRestore();
  });
});
