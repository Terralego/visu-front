import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { PartnerButton } from './PartnerButton';

jest.mock('./NavBarItemTablet', () => () => <div className="container">NavBarItemTablet</div>);
jest.mock('./NavBarItemDesktop', () => () => <div className="container">NavBarItemDesktop</div>);

it('should render correctly in mode desktop', () => {
  const tree = renderer.create(
    <PartnerButton />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should render correctly in mode mobile', () => {
  const tree = renderer.create(
    <PartnerButton isMobileSized />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should update isOpen state when open/close is called', () => {
  const wrapper = shallow(
    <PartnerButton />,
  );

  expect(wrapper.state('isOpen')).toBe(false);
  wrapper.instance().open();
  expect(wrapper.state('isOpen')).toBe(true);
  wrapper.instance().close();
  expect(wrapper.state('isOpen')).toBe(false);
});
