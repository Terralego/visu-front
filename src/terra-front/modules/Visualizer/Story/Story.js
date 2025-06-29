import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Button, Intent } from '@blueprintjs/core';
import { toggleLayerVisibility } from '../../Map/services/mapUtils';
import translateMock from '../../../utils/translate';

import './styles.scss';

const toggleLayers = map => ({ layers, active }) =>
  layers.forEach(layerId =>
    toggleLayerVisibility(map, layerId, active ? 'visible' : 'none'));

const resetLayers = map => ({ layers = [] }) => {
  toggleLayers(map)({
    layers,
    active: false,
  });
};

export const Story = ({ map, story: { beforeEach = [], slides }, setLegends, translate }) => {
  const [step, setStep] = useState(0);

  const slideCount = slides.length - 1;

  const { layouts = [], legends } = useMemo(() => slides[step], [slides, step]);

  useEffect(() => {
    if (!map) return;
    beforeEach.forEach(resetLayers(map));
    layouts.forEach(toggleLayers(map));
  }, [map, beforeEach, layouts]);

  useEffect(() => {
    setLegends(legends);
  }, [legends, setLegends]);

  const previousStep = () => {
    setStep(prevStep => prevStep - 1);
  };

  const nextStep = useCallback(() => {
    setStep(prevStep => (
      prevStep === slideCount
        ? 0
        : prevStep + 1
    ));
  }, [slideCount]);

  const { title, content } = slides[step];

  const displayPrevButton = step > 0;
  const displayButtons = slideCount > 0;

  const getNextLabel = () => {
    if (step === 0) {
      return translate('terralego.visualizer.story.start');
    }
    if (step === slideCount) {
      return translate('terralego.visualizer.story.restart');
    }
    return translate('terralego.visualizer.story.next');
  };

  return (
    <div className="storytelling">
      <div className="storytelling__content">
        <h2>{title}</h2>
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      {displayButtons && (
        <div className={classnames('storytelling__buttons', { 'storytelling__buttons--justified': displayPrevButton })}>
          {displayPrevButton && (
            <Button icon="chevron-left" onClick={previousStep}>{ translate('terralego.visualizer.story.previous') }</Button>
          )}

          <Button
            rightIcon={step !== slideCount && 'chevron-right'}
            icon={step === slideCount && 'step-backward'}
            intent={Intent.PRIMARY}
            onClick={nextStep}
          >
            {getNextLabel()}
          </Button>
        </div>
      )}
    </div>
  );
};

Story.propTypes = {
  map: PropTypes.shape({}),
  story: PropTypes.shape({
    beforeEach: PropTypes.arrayOf(PropTypes.shape({
      layers: PropTypes.arrayOf(PropTypes.string),
      active: PropTypes.bool,
    })),
    slides: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      content: PropTypes.string,
      layouts: PropTypes.arrayOf(PropTypes.shape({
        layers: PropTypes.arrayOf(PropTypes.string),
        active: PropTypes.bool,
      })),
      legends: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        items: PropTypes.arrayOf(PropTypes.shape({
          label: PropTypes.string,
          color: PropTypes.string,
        })),
      })),
    })),
  }).isRequired,
  setLegends: PropTypes.func,
  translate: PropTypes.func,
};

Story.defaultProps = {
  map: undefined,
  setLegends: () => {},
  translate: translateMock({
    'terralego.visualizer.story.start': 'Start',
    'terralego.visualizer.story.next': 'Next',
    'terralego.visualizer.story.previous': 'Previous',
    'terralego.visualizer.story.restart': 'Restart',
  }),
};

export default Story;
