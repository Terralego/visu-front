import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LoginButton from '@terralego/core/components/LoginButton';
import { connectAuthProvider } from '@terralego/core/modules/Auth';
import SSOLoginFormRenderer from '@terralego/core/modules/Auth/components/LoginForm/SSOLoginFormRenderer';

import Sidebar, { SidebarItem, signedIn } from '../../../components/Sidebar';
import { fetchAllViews } from '../../../services/visualizer';

import PartnerButton from './PartnerButton';

import './styles.scss';

export const Header = ({
  env: { VIEW_ROOT_PATH },
  authenticated,
  settings: {
    theme: { logo = '', logoUrl = '/' } = {},
    ssoAuth: {
      loginUrl,
      logoutUrl,
      ssoButtonText,
      defaultButtonText,
    } = {},
    extraMenuItems = [],
    allowUserRegistration,
    infoContent,
    loginMessage,
  },
}) => {
  const { t } = useTranslation();
  const [views, setViews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!VIEW_ROOT_PATH) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    fetchAllViews(VIEW_ROOT_PATH)
      .then(loadedViews => isMounted && setViews(loadedViews))
      .catch(() => isMounted && setHasError(true))
      .finally(() => isMounted && setIsLoading(false));

    return () => {
      isMounted = false;
    };
  }, [VIEW_ROOT_PATH]);

  const viewItems = useMemo(() => views.map(({ id, label, href, icon }) => (
    <SidebarItem key={id} id={id} label={label} href={href} icon={icon} />
  )), [views]);

  const extraItems = useMemo(() => extraMenuItems.map(({ id, label, href, icon }) => (
    <SidebarItem key={id || href} id={id} label={label} href={href} icon={icon} />
  )), [extraMenuItems]);

  return (
    <Sidebar
      label={t('menu.label')}
      loading={isLoading}
      error={hasError}
      errorLabel={t('menu.views_error')}
      header={(
        <SidebarItem
          variant="brand"
          id="welcome"
          label={t('menu.home')}
          href={logoUrl}
          icon={logo}
          exact
        />
      )}
      items={viewItems}
      links={extraItems}
    >
      <PartnerButton
        label={t('menu.informations')}
        icon={<InfoOutlinedIcon />}
        content={infoContent}
      />
      <LoginButton
        trigger={SidebarItem}
        sx={authenticated ? signedIn : undefined}
        icon={authenticated ? <LogoutIcon /> : <LoginIcon />}
        label={authenticated ? t('menu.logout') : t('menu.login')}
        translate={t}
        allowUserRegistration={allowUserRegistration}
        ssoLink={authenticated ? logoutUrl : loginUrl}
        ssoButtonText={ssoButtonText}
        defaultButtonText={defaultButtonText}
        loginMessage={loginMessage}
        render={loginUrl ? SSOLoginFormRenderer : undefined}
      />
    </Sidebar>
  );
};

Header.propTypes = {
  env: PropTypes.shape({
    VIEW_ROOT_PATH: PropTypes.string,
  }),
  authenticated: PropTypes.bool,
  settings: PropTypes.shape({
    theme: PropTypes.shape({
      logo: PropTypes.string,
      logoUrl: PropTypes.string,
    }),
    ssoAuth: PropTypes.shape({
      loginUrl: PropTypes.string,
      logoutUrl: PropTypes.string,
      ssoButtonText: PropTypes.string,
      defaultButtonText: PropTypes.string,
    }),
    extraMenuItems: PropTypes.array,
  }),
};

Header.defaultProps = {
  authenticated: false,
  settings: {
    theme: {
      logo: '',
      logoUrl: '/',
    },
    ssoAuth: {
      loginUrl: undefined,
      logoutUrl: undefined,
      ssoButtonText: undefined,
      defaultButtonText: undefined,
    },
    extraMenuItems: [],
  },
  env: {
    VIEW_ROOT_PATH: '',
  },
};

export default connectAuthProvider('authenticated')(Header);
