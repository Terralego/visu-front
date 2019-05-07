import React from 'react';
import classnames from 'classnames';
import { Button } from '@blueprintjs/core';
import FeatureProperties from '@terralego/core/modules/Map/FeatureProperties';
import MarkdownRenderer from '@terralego/core/modules/Template/MarkdownRenderer';
import './styles.scss';

class Details extends React.Component {
  state = {
    index: -1,
    visibility: false,
  }

  componentDidMount () {
    const {
      feature: { properties: { _id } = {} } = {},
      features,
    } = this.props;
    this.setVisibility(features.some(({ _id: id }) => id === _id));
    this.updateIndex(_id);
  }

  componentDidUpdate ({
    feature: { properties: { _id: prevId } = {} } = {},
    features: prevFeatures,
  }) {
    const {
      feature: { properties: { _id } = {} } = {},
      features,
    } = this.props;
    if (prevFeatures !== features) {
      this.setVisibility(features.some(({ _id: id }) => id === _id));
    }
    if (prevId !== _id) {
      this.updateIndex(_id);
    }
  }

  getIndexFeature = index => {
    const { features } = this.props;
    const featuresLength = features.length;
    if (index <= -1) {
      return featuresLength - 1;
    }
    if (index === featuresLength) {
      return 0;
    }
    return index;
  }

  setVisibility (visibility) {
    this.setState({ visibility });
  }

  updateIndex (id) {
    const { features } = this.props;
    if (features.length) {
      this.setState({ index: features.findIndex(({ _id }) => _id === id) });
    }
  }

  handleChange (direction) {
    const { onChange } = this.props;
    const { index: prevIndex } = this.state;
    const index = this.getIndexFeature(prevIndex + direction);
    onChange(index);
    return this.setState({ index });
  }

  render () {
    const {
      visible,
      interaction: { template, fetchProperties = {} } = {},
      feature: { properties } = {},
      onClose = () => null,
      features,
    } = this.props;
    const { index, visibility } = this.state;
    const isCarrousel = features.length > 1;
    const featureToDisplay = features.length > 0 && index !== -1 ? features[index] : properties;

    const isDetailVisible = visible && (features.length === 0 || visibility);

    return (
      <div
        className={classnames(
          'view-details',
          'bp3-light',
          { 'view-details--visible': isDetailVisible },
        )}
      >
        <div className="view-details__close">
          <Button
            type="button"
            className="view-details__close-button"
            onClick={onClose}
            icon="cross"
            minimal
          />
        </div>
        {visible && (
        <div className="view-details__wrapper">
          <div
            className={classnames(
              'view-details__button',
              'view-details__button--prev',
              { 'view-details__button--active': isCarrousel },
            )}
          >
            <Button
              type="button"
              onClick={() => this.handleChange(-1)}
              icon="chevron-left"
              minimal
            />
          </div>
          <div className="view-details__content">
            <FeatureProperties
              {...fetchProperties}
              properties={featureToDisplay}
            >
              {({ properties: newProperties, ...staticProperties }) => (
                <MarkdownRenderer
                  template={template}
                  {...staticProperties}
                  {...newProperties}
                />
              )}
            </FeatureProperties>
          </div>
          <div
            className={classnames(
              'view-details__button',
              'view-details__button--next',
              { 'view-details__button--active': isCarrousel },
            )}
          >
            <Button
              type="button"
              onClick={() => this.handleChange(1)}
              icon="chevron-right"
              minimal
            />
          </div>
        </div>
        )}
      </div>
    );
  }
}

export default Details;
