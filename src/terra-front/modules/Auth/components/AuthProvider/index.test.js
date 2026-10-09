import AuthProvider from './index';
import { clearToken, closeServerSession } from '../../services/auth';

vi.mock('../../services/auth', () => ({
  getToken: vi.fn(),
  obtainToken: vi.fn(),
  refreshToken: vi.fn(),
  clearToken: vi.fn(),
  closeServerSession: vi.fn(),
  createToken: vi.fn(),
}));

const buildProvider = () => {
  const provider = new AuthProvider({});
  provider.setState = vi.fn();
  return provider;
};

beforeEach(() => {
  vi.clearAllMocks();
  closeServerSession.mockResolvedValue(undefined);
});

it('should close the server session before clearing the token', async () => {
  const calls = [];
  closeServerSession.mockImplementation(async () => {
    await Promise.resolve();
    calls.push('session');
  });
  clearToken.mockImplementation(() => calls.push('token'));

  const provider = buildProvider();
  await provider.logoutAction();

  expect(calls).toEqual(['session', 'token']);
  expect(provider.setState).toHaveBeenCalledWith({ authenticated: false, user: null });
});

it('should ignore the sso logout url, which nginx does not proxy', async () => {
  const provider = buildProvider();
  await provider.logoutAction('/accounts/logout/');

  expect(closeServerSession).toHaveBeenCalledWith();
});

it('should still log out when the server session cannot be closed', async () => {
  closeServerSession.mockRejectedValue(new Error('offline'));
  vi.spyOn(console, 'error').mockImplementation(() => {});

  const provider = buildProvider();
  await provider.logoutAction();

  expect(clearToken).toHaveBeenCalled();
  expect(provider.setState).toHaveBeenCalledWith({ authenticated: false, user: null });
});
