/* eslint-disable no-undef */
import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import LocationPicker from './LocationPicker';

jest.mock('maplibre-gl', () => ({}));
jest.mock('react-map-gl/maplibre', () => ({
  Map: () => <div data-testid="map">Map</div>,
  Marker: () => <div data-testid="marker">Marker</div>,
}));

it('should render correctly with no location', () => {
  const tree = renderer.create(<LocationPicker value={null} onChange={() => {}} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should render correctly with location selected', () => {
  const tree = renderer
    .create(<LocationPicker value={{ lat: 48.8534, lng: 2.3488 }} onChange={() => {}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('should render correctly with map open', () => {
  const wrapper = shallow(<LocationPicker value={null} onChange={() => {}} />);
  wrapper.setState({ mapOpen: true });
  const tree = renderer.create(wrapper.getElement()).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should open map when button is clicked', () => {
  const wrapper = shallow(<LocationPicker value={null} onChange={() => {}} />);

  const button = wrapper.find('Button');
  button.simulate('click');

  expect(wrapper.state('mapOpen')).toBe(true);
});

it('should call onChange when map is clicked', () => {
  const onChange = jest.fn();
  const wrapper = shallow(<LocationPicker value={null} onChange={onChange} />);

  wrapper.setState({ mapOpen: true });
  const map = wrapper.find('Map');

  map.simulate('click', {
    lngLat: { lng: 2.3488, lat: 48.8534 },
  });

  expect(onChange).toHaveBeenCalledWith({ lng: 2.3488, lat: 48.8534 });
});

it('should clear location and close map when clear button is clicked', () => {
  const onChange = jest.fn();
  const wrapper = shallow(
    <LocationPicker value={{ lat: 48.8534, lng: 2.3488 }} onChange={onChange} />,
  );

  wrapper.setState({ mapOpen: true });
  const clearButton = wrapper.find('IconButton');
  clearButton.simulate('click');

  expect(onChange).toHaveBeenCalledWith(null);
  expect(wrapper.state('mapOpen')).toBe(false);
});

it('should disable add button when location is selected', () => {
  const wrapper = shallow(
    <LocationPicker value={{ lat: 48.8534, lng: 2.3488 }} onChange={() => {}} />,
  );

  const button = wrapper.find('Button');
  expect(button.props().disabled).toBe(true);
});

it('should format coordinates correctly', () => {
  const wrapper = shallow(
    <LocationPicker value={{ lat: 48.853421, lng: 2.348832 }} onChange={() => {}} />,
  );

  const instance = wrapper.instance();
  const formatted = instance.formatCoordinates({ lat: 48.853421, lng: 2.348832 });

  expect(formatted).toBe('48.853421, 2.348832');
});

it('should render with custom helper text', () => {
  const wrapper = shallow(
    <LocationPicker value={null} onChange={() => {}} helperText="Custom help text" />,
  );

  wrapper.setState({ mapOpen: true });
  const helperText = wrapper.find('Typography').last();

  expect(helperText.props().children).toBe('Custom help text');
});
