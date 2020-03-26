import React from 'react';
import renderer from 'react-test-renderer';

import { Header } from './Header';

jest.mock('react-router-dom', () => (
  {
    Route: () => null,
    Switch: () => null,
    Link: () => null,
    withRouter: ({ children }) => children,
  }
));

jest.mock('./PartnerButton', () => () => 'PartnerButton');

jest.mock('../../../services/visualizer', () => (
  {
    fetchAllViews: jest.fn(() => [
      {
        name: 'foo',
        slug: 'foo',
        custom_icon: 'logo',
      }, {
        name: 'bar',
        slug: 'bar',
      },
    ]),
  }
));

it('should render correctly', () => {
  const tree = renderer.create(
    <Header />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should render correctly with header open in mobile view', () => {
  const tree = renderer.create(
    <Header
      isMobileSized
      isHeaderOpen
    />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should render correctly with header close in mobile view', () => {
  const tree = renderer.create(
    <Header
      location={{ pathname: '/' }}
      env={{ VIEW_ROOT_PATH: '' }}
      settings={{}}
      isMobileSized
      isHeaderOpen={false}
    />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

/* it('should open navbar in mobile', () => {
  const toggleHeader = jest.fn();
  const wrapper = shallow(<Header toggleHeader={toggleHeader} />);
  const instance = wrapper.instance();
  const target = '<div class="main__header__target--test" />';

  instance.containerRef.current = {
    target,
    contains: () => true,
  };
  instance.listener({ target });

  expect(instance.props.toggleHeader).toHaveBeenCalledWith();
}); */
