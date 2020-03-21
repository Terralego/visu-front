import { useEffect } from 'react';

export const SplashScreen = ({ children }) => {
  useEffect(() => {
    document.body.classList.remove('with-splash');
    setTimeout(() => {
      document.body.querySelector('.splash-screen_container').remove();
    }, 5000);
  }, []);
  return children;
};

export default SplashScreen;
