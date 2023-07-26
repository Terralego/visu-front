import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

import { PartnerButton, PartnerOverlayContent } from './PartnerButton';

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

it('should render correctly overlay content', () => {
  const wrapper = renderer.create(
    <PartnerOverlayContent content="<b>Hello</b> world!" />,
  );
  expect(wrapper.toJSON()).toMatchSnapshot();
});

it('should have "aria-expanded" matching modal state', () => {
  const wrapper = mount(<PartnerButton />);
  const button = wrapper.find('button').first();

  button.simulate('click');
  expect(button.instance().getAttribute('aria-expanded')).toBe('true');

  const backdrop = wrapper.find('.bp3-overlay-backdrop').first();
  backdrop.simulate('mousedown');

  expect(button.instance().getAttribute('aria-expanded')).toBe('false');
});
