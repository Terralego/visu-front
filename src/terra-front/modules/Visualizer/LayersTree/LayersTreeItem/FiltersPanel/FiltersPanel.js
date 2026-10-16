import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import FiltersPanelContent from './FiltersPanelContent';
import './styles.scss';

export class FiltersPanel extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    onMount: PropTypes.func,
    setLayerState: PropTypes.func,
    searchPropertyValues: PropTypes.func,
  };

  static defaultProps = {
    visible: false,
    onMount () {},
    setLayerState () {},
    searchPropertyValues: null,
  };

  containerRef = React.createRef();

  componentDidMount () {
    const { onMount } = this.props;
    const { panelContentRef = {}, containerRef } = this;
    onMount([panelContentRef.current, containerRef.current]);
  }

  getPosition () {
    const { containerRef: { current: container } } = this;
    if (!container) return {};
    const { top, left, width, height } = container.getBoundingClientRect();
    return { top, left, width, height };
  }

  getPanelRef = ref => {
    this.panelContentRef = { current: ref };
  }

  handleSearch = (property, query) => {
    const { searchPropertyValues, layer, activeLayer } = this.props;
    const target = activeLayer || layer;
    const { filters: { layer: index } = {}, baseEsQuery } = target || {};

    if (!searchPropertyValues || !index) return;

    searchPropertyValues(index, property, baseEsQuery, query);
  };

  handleChange = filters => {
    const { setLayerState, layer } = this.props;
    setLayerState({ layer, state: { filters, total: null } });
  }

  render () {
    const { visible, children, searchPropertyValues, ...props } = this.props;
    const { containerRef, getPanelRef, handleChange, handleSearch } = this;

    const position = this.getPosition();

    const portal = ReactDOM.createPortal(
      <FiltersPanelContent
        onRef={getPanelRef}
        visible={visible}
        onChange={handleChange}
        onSearch={searchPropertyValues ? handleSearch : undefined}
        {...props}
        {...position}
      />,
      document.body,
    );
    return (
      <div ref={containerRef}>
        {children}
        {portal}
      </div>
    );
  }
}

export default FiltersPanel;
