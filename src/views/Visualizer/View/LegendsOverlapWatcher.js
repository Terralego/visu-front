import PropTypes from 'prop-types';
import { useEffect } from 'react';

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

export const MAX_MOBILE_HEIGHT_RATIO = 0.5;

const LegendsOverlapWatcher = ({ panelsOpen, isMobileSized, onChange }) => {
  useEffect(() => {
    const legends = document.querySelector(LEGENDS_SELECTOR);

    if (!legends) {
      onChange(false);
      return undefined;
    }

    const panels = panelsOpen ? Array.from(document.querySelectorAll(PANELS_SELECTOR)) : [];

    const check = () => {
      const legendsRect = legends.getBoundingClientRect();
      const isTooTall = isMobileSized
        && legendsRect.height > window.innerHeight * MAX_MOBILE_HEIGHT_RATIO;

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
  }, [panelsOpen, isMobileSized, onChange]);

  return null;
};

LegendsOverlapWatcher.propTypes = {
  panelsOpen: PropTypes.bool,
  isMobileSized: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

LegendsOverlapWatcher.defaultProps = {
  panelsOpen: false,
  isMobileSized: false,
};

export default LegendsOverlapWatcher;
