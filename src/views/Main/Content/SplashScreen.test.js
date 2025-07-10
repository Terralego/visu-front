import React from 'react';
import { shallow } from 'enzyme';
import { SplashScreen } from './SplashScreen';

// Mock the connectSettings HOC
jest.mock('../Provider/context', () => ({
  connectSettings: jest.fn(() => Component => props => <Component {...props} />),
}));

describe('SplashScreen', () => {
  it('should render children correctly', () => {
    const wrapper = shallow(
      <SplashScreen settings={{}}>
        <div>Test Content</div>
      </SplashScreen>,
    );

    expect(wrapper.find('div').text()).toBe('Test Content');
  });

  it('should render without settings', () => {
    const wrapper = shallow(
      <SplashScreen>
        <div>Test Content</div>
      </SplashScreen>,
    );

    expect(wrapper.find('div').text()).toBe('Test Content');
  });

  it('should render with settings', () => {
    const settings = {
      theme: {
        splashScreenEnabled: true,
        splashScreen: 'test-image.png',
      },
    };

    const wrapper = shallow(
      <SplashScreen settings={settings}>
        <div>Test Content</div>
      </SplashScreen>,
    );

    expect(wrapper.find('div').text()).toBe('Test Content');
  });
});
