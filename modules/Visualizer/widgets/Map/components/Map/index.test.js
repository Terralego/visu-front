import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { Map } from './';

const props = {
  styles: {},
  accessToken: 'pk.eyJ1IjoidGFzdGF0aGFtMSIsImEiOiJjamZ1ejY2bmYxNHZnMnhxbjEydW9sM29hIn0.w9ndNH49d91aeyvxSjKQqg',
};

jest.mock('mapbox-gl', () => {
  const map = {
    addControl: jest.fn(() => {}),
    removeControl: jest.fn(() => {}),
    flyTo: jest.fn(() => {}),
    setMaxBounds: jest.fn(() => [
      [-5.7283633634, 42.114925591], [8.8212564471, 51.3236272327], // France coordinates
    ]),
    setMaxZoom: jest.fn(() => 20),
    setMinZoom: jest.fn(() => 5),
    setStyle: jest.fn(() => 'mapbox://styles/mapbox/light-v9'),
    setLayoutProperty: jest.fn(),
    setPaintProperty: jest.fn(),
    on: jest.fn(),
    once (event, fn) {
      fn(map);
    },
    getStyle: jest.fn(() => ({ layers: [{ id: 'foo' }, { id: 'bar' }] })),
  };
  return {
    Map: jest.fn(() => map),
    ScaleControl: jest.fn(() => {}),
    NavigationControl: jest.fn(() => {}),
    AttributionControl: jest.fn(() => {}),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

it('should render correctly', () => {
  const tree = renderer.create(<Map {...props} />).toJSON();
  expect(tree).toMatchSnapshot();
});

describe('Mount and update methods', () => {
  it('should call initMapProperties in mount', async done => {
    jest.spyOn(Map.prototype, 'initMapProperties');
    const wrapper = shallow(<Map {...props} />);
    await true;
    expect(wrapper.instance().initMapProperties).toHaveBeenCalled();
    done();
  });

  it('should call updateMapProperties in update', async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    jest.spyOn(wrapper.instance(), 'updateMapProperties');
    wrapper.setProps({ maxZoom: 7 });
    expect(wrapper.instance().updateMapProperties).toHaveBeenCalled();
    done();
  });

  it('should call updateFlyTo in updateMapProperties', async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    jest.spyOn(wrapper.instance(), 'updateFlyTo');
    wrapper.setProps({ maxZoom: 7 });
    expect(wrapper.instance().updateFlyTo).toHaveBeenCalled();
    done();
  });
});

describe('on properties changes', () => {
  it('should call flyTo and set new flyTo on update', async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    const flyTo = {
      center: [10, 9],
      zoom: 7,
      speed: true,
      curve: false,
      easing: () => {},
    };

    wrapper.setProps({ flyTo });
    expect(wrapper.instance().map.flyTo).toHaveBeenCalled();
    expect(wrapper.instance().props.flyTo).toBe(flyTo);
    done();
  });

  it('should call flyTo and not update flyTo property', async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    wrapper.setProps({ maxZoom: 9 });
    expect(wrapper.instance().map.flyTo).not.toHaveBeenCalled();
    done();
  });

  it('should call setMaxBound on property change', async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    wrapper.setProps({ maxBounds: [[0, 0], [0, 0]] });
    expect(wrapper.instance().map.setMaxBounds).toHaveBeenCalled();
    done();
  });

  it("should not call setMaxBound if property doesn't change", async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    wrapper.setProps({ maxBounds: false });
    expect(wrapper.instance().map.setMaxBounds).not.toHaveBeenCalled();
    done();
  });

  it('should call setMaxZoom on property change', async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    wrapper.setProps({ maxZoom: 7 });
    expect(wrapper.instance().map.setMaxZoom).toHaveBeenCalled();
    done();
  });

  it("should not call setMaxZoom if property doesn't change", async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    wrapper.setProps({ maxZoom: 20 });
    expect(wrapper.instance().map.setMaxZoom).not.toHaveBeenCalled();
    done();
  });

  it('should call setMinZoom on property change', async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    wrapper.setProps({ minZoom: 7 });
    expect(wrapper.instance().map.setMinZoom).toHaveBeenCalled();
    done();
  });

  it("should not call setMinZoom if property doesn't change", async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    wrapper.setProps({ minZoom: 0 });
    expect(wrapper.instance().map.setMinZoom).not.toHaveBeenCalled();
    done();
  });

  it('should call setStyle on property change', async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    wrapper.setProps({ mapStyle: '' });
    expect(wrapper.instance().map.setStyle).toHaveBeenCalled();
    done();
  });

  it("should not call setStyle if property doesn't change", async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    wrapper.setProps({ styles: 'mapbox://styles/mapbox/light-v9' });
    expect(wrapper.instance().map.setStyle).not.toHaveBeenCalled();
    done();
  });

  it('should call addControl on init', async done => {
    const wrapper = shallow(<Map {...props} />);
    await new Promise(resolve => setTimeout(resolve, 1));
    const instance = wrapper.instance();
    expect(instance.map.addControl).toHaveBeenCalledWith(instance.scaleControl);
    expect(instance.map.addControl).toHaveBeenCalledWith(instance.navigationControl);
    expect(instance.map.addControl).toHaveBeenCalledWith(instance.attributionControl);
    expect(instance.map.addControl).toHaveBeenCalledTimes(3);
    done();
  });

  it('should not call removeControl on init', async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    expect(wrapper.instance().map.removeControl).toHaveBeenCalledTimes(0);
    done();
  });

  it('should call addControl if true or removeControl if false', async done => {
    const wrapper = shallow(<Map {...props} />);
    await true;
    const instance = wrapper.instance();

    wrapper.setProps({ displayScaleControl: false });
    wrapper.setProps({ displayNavigationControl: false });
    wrapper.setProps({ displayAttributionControl: false });
    expect(instance.map.addControl).toHaveBeenCalledTimes(3);
    expect(instance.map.removeControl).toHaveBeenCalledTimes(3);

    wrapper.setProps({ displayScaleControl: true });
    wrapper.setProps({ displayNavigationControl: true });
    wrapper.setProps({ displayAttributionControl: true });
    expect(instance.map.addControl).toHaveBeenCalledTimes(6);
    expect(instance.map.removeControl).toHaveBeenCalledTimes(3);
    done();
  });
});

it('should render div', () => {
  const wrapper = shallow(<Map {...props} />);
  expect(wrapper.find('div').hasClass('tf-map')).toEqual(true);
  expect(wrapper.find('div').length).toBe(1);
});

it('should have a ref', () => {
  const wrapper = shallow(<Map {...props} />);
  expect(wrapper.instance().containerEl).toEqual(React.createRef());
});

it('should update map', async done => {
  const wrapper = shallow(<Map {...props} />);
  await true;
  const { map } = wrapper.instance();
  wrapper.setProps({ stylesToApply: { layouts: [{ id: 'foo', visibility: 'visible' }] } });
  expect(map.setLayoutProperty).toHaveBeenCalledWith('foo', 'visibility', 'visible');
  wrapper.setProps({ stylesToApply: { layouts: [{ id: 'foo', visibility: 'none' }] } });
  expect(map.setLayoutProperty).toHaveBeenCalledWith('foo', 'visibility', 'none');

  wrapper.setProps({ stylesToApply: { layouts: [{ id: 'foo', paint: { 'fill-color': '#000000' } }] } });
  expect(map.setPaintProperty).toHaveBeenCalledWith('foo', 'fill-color', '#000000');
  done();
});

it('should add click listener on each layers', async done => {
  const wrapper = shallow(<Map {...props} />);
  await true;
  const { map } = wrapper.instance();
  expect(map.getStyle).toHaveBeenCalled();
  expect(wrapper.instance().clickListeners.length).toBe(2);
  done();
});
