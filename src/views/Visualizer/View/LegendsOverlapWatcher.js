import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

export const rectsOverlap = (a, b) =>
  a.width > 0 &&
  a.height > 0 &&
  b.width > 0 &&
  b.height > 0 &&
  a.left < b.right &&
  b.left < a.right &&
  a.top < b.bottom &&
  b.top < a.bottom;

const LEGENDS_SELECTOR = '.interactive-map__legends';
const PANELS_SELECTOR = '.map-overlay-panel';

export const MAX_SMALL_SCREEN_WIDTH = 600;
export const MAX_SMALL_SCREEN_HEIGHT_RATIO = 0.5;

const LegendsOverlapWatcher = ({ panelsOpen, legendsCount, onChange }) => {
  const [legends, setLegends] = useState(null);

  useEffect(() => {
    const found = document.querySelector(LEGENDS_SELECTOR);

    if (found) {
      setLegends(found);
      return undefined;
    }

    setLegends(null);

    const observer = new MutationObserver(() => {
      const node = document.querySelector(LEGENDS_SELECTOR);
      if (node) {
        setLegends(node);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [legendsCount]);

  useEffect(() => {
    if (!legends) {
      onChange(false);
      return undefined;
    }

    const panels = panelsOpen ? Array.from(document.querySelectorAll(PANELS_SELECTOR)) : [];

    const check = () => {
      const legendsRect = legends.getBoundingClientRect();
      const isTooTall = window.innerWidth <= MAX_SMALL_SCREEN_WIDTH
        && legendsRect.height > window.innerHeight * MAX_SMALL_SCREEN_HEIGHT_RATIO;

      onChange(isTooTall
        || panels.some(panel => rectsOverlap(legendsRect, panel.getBoundingClientRect())));
    };

    check();

    const observer = new ResizeObserver(check);
    observer.observe(legends);
    panels.forEach(panel => {
      observer.observe(panel);
      panel.addEventListener('transitionend', check);
    });
    window.addEventListener('resize', check);

    return () => {
      observer.disconnect();
      panels.forEach(panel => panel.removeEventListener('transitionend', check));
      window.removeEventListener('resize', check);
    };
  }, [panelsOpen, legends, onChange]);

  return null;
};

LegendsOverlapWatcher.propTypes = {
  panelsOpen: PropTypes.bool,
  legendsCount: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

LegendsOverlapWatcher.defaultProps = {
  panelsOpen: false,
  legendsCount: 0,
};

export default LegendsOverlapWatcher;
