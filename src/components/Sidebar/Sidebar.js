import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, ButtonBase, Skeleton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  group,
  rail,
  scrollArea,
  scrollButtonIcon,
  scrollDown,
  scroller,
  scrollUp,
  skeleton,
  spacer,
} from './styles';

const SKELETONS = [0, 1, 2];
const FADE_THRESHOLD = 2;

const useScrollFades = watched => {
  const ref = useRef(null);
  const [fades, setFades] = useState({ top: false, bottom: false });

  const update = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    const { scrollTop, scrollHeight, clientHeight } = element;
    setFades({
      top: scrollTop > FADE_THRESHOLD,
      bottom: scrollTop + clientHeight < scrollHeight - FADE_THRESHOLD,
    });
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    update();
    element.addEventListener('scroll', update, { passive: true });

    const observer = new ResizeObserver(update);
    observer.observe(element);
    Array.from(element.children).forEach(child => observer.observe(child));

    return () => {
      element.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [update, watched]);

  return [ref, fades];
};

export const Sidebar = ({
  label,
  header,
  items,
  links,
  children,
  loading,
  error,
  errorLabel,
}) => {
  const [scrollerRef, fades] = useScrollFades(items);

  const scrollBy = direction => {
    const element = scrollerRef.current;
    if (!element) return;
    element.scrollBy({ top: direction * element.clientHeight * 0.8, behavior: 'smooth' });
  };

  return (
    <Box component="nav" aria-label={label} aria-busy={loading} sx={rail}>
      {header}
      <Box
        sx={scrollArea}
        data-fade-top={fades.top}
        data-fade-bottom={fades.bottom}
      >
        {fades.top && (
          <ButtonBase sx={scrollUp} onClick={() => scrollBy(-1)} tabIndex={-1} aria-hidden>
            <KeyboardArrowUpIcon sx={scrollButtonIcon} />
          </ButtonBase>
        )}
        {fades.bottom && (
          <ButtonBase sx={scrollDown} onClick={() => scrollBy(1)} tabIndex={-1} aria-hidden>
            <KeyboardArrowDownIcon sx={scrollButtonIcon} />
          </ButtonBase>
        )}
        <Box ref={scrollerRef} sx={scroller}>
          {loading && SKELETONS.map(index => (
            <Skeleton key={index} variant="rounded" animation="wave" sx={skeleton} />
          ))}
          {!loading && error && (
            <Tooltip title={errorLabel} placement="right">
              <ErrorOutlineIcon role="img" aria-label={errorLabel} sx={{ opacity: 0.85 }} />
            </Tooltip>
          )}
          {!loading && items}
        </Box>
      </Box>
      <Box sx={spacer} />
      {links.length > 0 && <Box sx={group}>{links}</Box>}
      <Box sx={spacer} />
      <Box sx={group}>{children}</Box>
    </Box>
  );
};

Sidebar.propTypes = {
  label: PropTypes.string.isRequired,
  header: PropTypes.node,
  items: PropTypes.arrayOf(PropTypes.node),
  links: PropTypes.arrayOf(PropTypes.node),
  children: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  errorLabel: PropTypes.string,
};

Sidebar.defaultProps = {
  header: null,
  items: [],
  links: [],
  children: null,
  loading: false,
  error: false,
  errorLabel: '',
};

export default Sidebar;
