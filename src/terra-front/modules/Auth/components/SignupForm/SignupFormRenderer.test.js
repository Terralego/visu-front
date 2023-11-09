import React from 'react';
import renderer from 'react-test-renderer';
import SignupFormRenderer from './SignupFormRenderer';

it('should render correctly', () => {
  const tree = renderer
    .create(
      <>
        <SignupFormRenderer showPassword />
        <SignupFormRenderer done />
        <SignupFormRenderer showPassword errors={{ email: true, password: true }} />
      </>,
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});
