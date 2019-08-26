import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import Details from './Details';

jest.mock('@blueprintjs/core', () => ({
  Button () {
    return <p>Button</p>;
  },
}));

jest.mock('@terralego/core/modules/Map/FeatureProperties', () =>
  ({ children }) => children({ properties: {} }));

it('should render correctly with content', () => {
  const tree = renderer.create((
    <Details
      visible
      interaction={{
        template:
`# Hello world
 This is {{foo}}`,
      }}
      features={[]}
    />
  )).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should render correctly without content', () => {
  const tree = renderer.create((
    <Details
      interaction={{
        template:
  `# Hello world
  This is {{foo}}`,
      }}
      features={[]}
    />
  )).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should close', () => {
  const onClose = jest.fn();
  const wrapper = shallow((
    <Details
      features={[]}
      onClose={onClose}
    />
  ));
  wrapper.find('Button').props().onClick();
  expect(onClose).toHaveBeenCalled();
});

it('should do nothing', () => {
  const onClose = jest.fn();
  const wrapper = shallow((
    <Details features={[]} />
  ));
  wrapper.find('Button').props().onClick();
  expect(onClose).not.toHaveBeenCalled();
});
