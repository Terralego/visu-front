import { useEffect } from 'react';
import { connectSettings } from '../Provider/context';

export const SplashScreen = ({ children, settings }) => {
  useEffect(() => {
    const hideSplash = () => {
      document.body.classList.remove('with-splash');
    };
    const unmountSplash = () => {
      const splashScreen = document.querySelector('.splash-screen_container');
      splashScreen && splashScreen.remove();
    };
    if (settings?.theme?.splashScreenEnabled && settings?.theme?.splashScreen) {
      const existingImg = document.querySelector('.splash-screen_container img');
      existingImg && existingImg.remove();
      const splashScreenImg = document.createElement('img');
      splashScreenImg.src = settings?.theme?.splashScreen;
      const splashScreenElement = document.querySelector('.splash-screen_container > .splash-screen');
      splashScreenElement && splashScreenElement.appendChild(splashScreenImg);
    }
    setTimeout(() => {
      hideSplash();
    }, 2000);
    setTimeout(() => {
      unmountSplash();
    }, 5000);
  }, [settings]);
  return children;
};

export default connectSettings('settings')(SplashScreen);
