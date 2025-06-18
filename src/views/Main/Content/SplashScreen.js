import { useEffect } from 'react';
import { connectSettings } from '../Provider/context';

export const SplashScreen = ({ children, settings }) => {
  useEffect(() => {
    document.body.classList.remove('with-splash');
    const removeSplash = () => {
      const splashScreen = document.querySelector('.splash-screen_container');
      splashScreen && splashScreen.remove();
    };
    if (settings?.theme?.splashScreenEnabled && settings?.theme?.splashScreen) {
      const splashScreenImg = document.createElement('img');
      splashScreenImg.src = settings?.theme?.splashScreen;
      const splashScreenElement = document.querySelector('.splash-screen_container > .splash-screen');
      splashScreenElement && splashScreenElement.appendChild(splashScreenImg);
    }
    setTimeout(() => {
      removeSplash();
    }, 5000);
  }, [settings]);
  return children;
};

export default connectSettings('settings')(SplashScreen);
