import React from 'react';
import classNames from 'classnames';
import {
  Tab,
  Tabs,
  Overlay,
  Classes,
  Button,
} from '@blueprintjs/core';
import { LoginForm, SignupForm } from '@terralego/core/modules/Auth';
import withDeviceSize from '@terralego/core/hoc/withDeviceSize';

import NavBarItemDesktop from '../NavBarItemDesktop';
import NavBarItemTablet from '../NavBarItemTablet';

export class LoginButton extends React.Component {
  state = {
    isOpen: false,
    hasCreated: false,
    isNewlyAuthenticated: false,
  }

  static defaultProps = {
    isMobileSized: false,
  }

  componentDidUpdate ({ authenticated: prevAuthenticated }) {
    const { authenticated } = this.props;
    if (authenticated && !prevAuthenticated) {
      this.togglePopin(false);
    }
  }

  togglePopin = isOpen => this.setState({ isOpen });

  confirmLogout = () => {
    const { logoutAction } = this.props;
    this.togglePopin(false);
    logoutAction();
  }

  onCreate = () => this.setState({ hasCreated: true });

  onDeviceSizeChange = (isMobileSized, ...props) => (
    isMobileSized
      ? <NavBarItemTablet {...props} />
      : <NavBarItemDesktop {...props} />
  );

  isAuthenticating = isNewlyAuthenticated => this.setState({ isNewlyAuthenticated })

  render () {
    const { t, isMobileSized, authenticated } = this.props;
    const { isOpen, hasCreated, isNewlyAuthenticated } = this.state;
    const { togglePopin, confirmLogout, isAuthenticating } = this;
    const NavBarItem = isMobileSized ? NavBarItemTablet : NavBarItemDesktop;
    const wantLogout = isOpen && authenticated && !isNewlyAuthenticated;
    return (
      <>
        <NavBarItem {...this.props} onClick={() => togglePopin(true)} />
        <Overlay
          className={classNames(
            Classes.OVERLAY_SCROLL_CONTAINER,
            Classes.DARK,
            'modal-signin',
          )}
          isOpen={isOpen}
          onClose={() => togglePopin(false)}
        >
          <div
            className={classNames(
              Classes.CARD,
              Classes.ELEVATION_4,
              'modal-signin__form',
            )}
          >
            {isOpen && !authenticated
            && (
            <Tabs id="login">
              <Tab
                id="signin"
                title="Connexion"
                panel={(
                  <LoginForm
                    onBeforeSubmitting={() => isAuthenticating(true)}
                    onAfterSubmitting={() => isAuthenticating(false)}
                    translate={t}
                  />
                )}
              />
              <Tab
                id="signup"
                title="Créer un compte"
                panel={hasCreated
                  ? <p>{t('auth.signupform.done')}</p>
                  : (
                    <SignupForm
                      translate={t}
                      showPassword={false}
                      onCreate={this.onCreate}
                    />
                  )}
              />
            </Tabs>
            )
            }
            {wantLogout && (
            <div
              id="logout"
            >
              <p>{t('auth.logout.confirm.label')}</p>
              <div className="modal-signin__form-buttons">
                <Button
                  text={t('auth.logout.cancel.button_label')}
                  onClick={() => togglePopin(false)}
                  minimal
                />
                <Button
                  text={t('auth.logout.confirm.button_label')}
                  onClick={confirmLogout}
                  intent="primary"
                />
              </div>
            </div>
            )
            }
          </div>
        </Overlay>
      </>
    );
  }
}

export default withDeviceSize()(LoginButton);
