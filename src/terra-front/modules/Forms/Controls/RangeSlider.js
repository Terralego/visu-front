import React from 'react';
import { RangeSlider as BPRangeSlider } from '@blueprintjs/core';
import PropTypes from 'prop-types';
import RangeComponent from './RangeComponent';
import { DEFAULT_MAX, DEFAULT_MIN } from './rangeConstants';

/**
 * Slider for editing a range.
 */
class RangeSlider extends RangeComponent {
  render () {
    const { onChange, value, ...props } = this.props;
    const { range } = this.state;

    return (
      <BPRangeSlider
        className="control--range__slider"
        value={range}
        onRelease={onChange}
        onChange={this.setRange}
        {...props}
      />
    );
  }
}

RangeSlider.propTypes = {
  value: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
};

RangeSlider.defaultProps = {
  value: undefined,
  onChange () {},
  min: DEFAULT_MIN,
  max: DEFAULT_MAX,
};

export default RangeSlider;
