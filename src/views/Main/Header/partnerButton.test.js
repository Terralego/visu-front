import React from 'react';
import renderer from 'react-test-renderer';
import { PartnerButton, PartnerOverlayContent } from './PartnerButton';

jest.mock('@terralego/core/components/NavBarItemTablet', () => () => <div className="container">NavBarItemTablet</div>);
jest.mock('@terralego/core/components/NavBarItemDesktop', () => () => <div className="container">NavBarItemDesktop</div>);

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
  const tree = renderer.create(
    <PartnerOverlayContent content="<b>Hello</b> world!" />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
