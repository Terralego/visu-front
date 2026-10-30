import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextBlock } from './SheetBlock';

vi.mock('maplibre-gl', () => ({ default: { Map: vi.fn() } }));

describe('TextBlock', () => {
  it('renders plain text as before', () => {
    const { container } = render(<TextBlock text={'ligne 1\nligne 2'} />);
    expect(container.textContent).toBe('ligne 1\nligne 2');
  });

  it('renders rich text as HTML', () => {
    render(<TextBlock text="<p>Un <strong>mot</strong> et un <a href='https://example.com' target='_blank'>lien</a></p>" />);
    expect(screen.getByText('mot').tagName).toBe('STRONG');
    const link = screen.getByRole('link', { name: 'lien' });
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('strips scripts, event handlers and javascript links', () => {
    const { container } = render(
      <TextBlock text={'<p>ok</p><script>alert(1)</script><img src="x" onerror="alert(2)"><a href="javascript:alert(3)">js</a>'} />,
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img').getAttribute('onerror')).toBeNull();
    expect(container.querySelector('a').getAttribute('href')).toBeNull();
  });
});
