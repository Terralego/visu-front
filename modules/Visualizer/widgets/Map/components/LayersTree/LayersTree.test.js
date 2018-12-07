import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { LayersTree } from './LayersTree';

it('should render correctly', () => {
  const layersTree = [{
    label: 'foo',
    layers: ['foo'],
  }, {
    label: 'bar',
    layers: ['bar'],
  }];
  const tree = renderer.create((
    <LayersTree
      layersTree={layersTree}
    />
  )).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should render a group', () => {
  const layersTree = [{
    group: 'foo',
    layers: [{
      label: 'foo',
      layers: ['foo'],
    }, {
      label: 'bar',
      layers: ['bar'],
    }],
  }];
  const tree = renderer.create((
    <LayersTree
      layersTree={layersTree}
    />
  )).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should change on toggle', () => {
  const onChange = jest.fn();
  const layer = {
    id: 'foo',
  };
  const wrapper = shallow(<LayersTree layersTree={[]} onChange={onChange} />);
  const instance = wrapper.instance();
  let currentAreActives = instance.state.areActives;
  jest.spyOn(currentAreActives, 'add');
  jest.spyOn(currentAreActives, 'delete');
  instance.onToggleChange(layer)();
  expect(onChange).toHaveBeenCalledWith({ layer, state: { active: true } });
  expect(instance.isActive(layer)).toBe(true);
  expect(currentAreActives.add).toHaveBeenCalledWith(layer);
  expect(currentAreActives.delete).not.toHaveBeenCalled();

  currentAreActives = instance.state.areActives;
  jest.spyOn(currentAreActives, 'add');
  jest.spyOn(currentAreActives, 'delete');
  instance.onToggleChange(layer)();
  expect(onChange).toHaveBeenCalledWith({ layer, state: { active: false } });
  expect(instance.isActive(layer)).toBe(false);
  expect(currentAreActives.add).not.toHaveBeenCalled();
  expect(currentAreActives.delete).toHaveBeenCalledWith(layer);

  currentAreActives = instance.state.areActives;
  jest.spyOn(currentAreActives, 'add');
  jest.spyOn(currentAreActives, 'delete');
  instance.onToggleChange(layer)();
  expect(onChange).toHaveBeenCalledWith({ layer, state: { active: true } });
  expect(instance.isActive(layer)).toBe(true);
  expect(currentAreActives.add).toHaveBeenCalledWith(layer);
  expect(currentAreActives.delete).not.toHaveBeenCalled();
});

it('should change opacity', () => {
  const onChange = jest.fn();
  const wrapper = shallow(<LayersTree layersTree={[]} onChange={onChange} />);
  const instance = wrapper.instance();
  jest.spyOn(instance, 'setState');
  instance.onOpacityChange({ label: 'foo' })(42);
  expect(instance.setState).toHaveBeenCalledWith({ opacities: { foo: 42 } });
  expect(onChange).toHaveBeenCalledWith({ layer: { label: 'foo' }, state: { opacity: 42 } });
});

it('should set initial state', () => {
  const instance = new LayersTree({ layersTree: [] }, {});
  expect(instance.state.areActives).toEqual(new Set());

  const layer = { id: 'map', initialState: { active: true } };
  const instance2 = new LayersTree({ layersTree: [layer] }, {});
  expect(instance2.state.areActives).toEqual(new Set([layer]));
});

it('should apply initial state', () => {
  const onChange = jest.fn();
  const instance = new LayersTree({
    layersTree: [{
      id: 'foo',
    }, {
      id: 'bar',
      initialState: {
        active: true,
      },
    }, {
      id: 'foofoo',
      initialState: {
        active: false,
      },
    }, {
      id: 'barbat',
      initialState: {
        something: true,
      },
    }],
    onChange,
  }, {});
  instance.componentDidMount();

  expect(onChange).toHaveBeenCalledWith({
    layer: {
      id: 'bar',
      initialState: {
        active: true,
      },
    },
    state: { active: true },
  });
  expect(onChange).toHaveBeenCalledWith({
    layer: {
      id: 'foofoo',
      initialState: {
        active: false,
      },
    },
    state: { active: false },
  });
});
