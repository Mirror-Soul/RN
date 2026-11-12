import * as SecureStore from 'expo-secure-store';
import { clearPendingCall, readPendingCall, savePendingCall } from './pendingCallStorage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store = SecureStore as unknown as { getItemAsync: jest.Mock; setItemAsync: jest.Mock; deleteItemAsync: jest.Mock };
const user = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const key = `pending_call_${user}`;

beforeEach(() => jest.clearAllMocks());

it('stores the call id under a per-account key', async () => {
  await savePendingCall(user, 41);
  expect(store.setItemAsync).toHaveBeenCalledWith(key, '41');
});

it('keeps the key valid for SecureStore even if the account id has unexpected characters', async () => {
  await savePendingCall('weird id/with:chars', 7);
  expect(store.setItemAsync.mock.calls[0][0]).toBe('pending_call_weird_id_with_chars');
});

it.each([
  [null, null],
  ['41', 41],
  ['0', null],
  ['-3', null],
  ['1.5', null],
  ['abc', null],
  ['', null],
])('reads the stored value %p as %p', async (raw, expected) => {
  store.getItemAsync.mockResolvedValue(raw);
  await expect(readPendingCall(user)).resolves.toBe(expected);
});

it('clears unconditionally when no call id is given', async () => {
  await clearPendingCall(user);
  expect(store.deleteItemAsync).toHaveBeenCalledWith(key);
});

it('clears only when the stored call is the one that ended', async () => {
  store.getItemAsync.mockResolvedValue('41');
  await clearPendingCall(user, 40);
  expect(store.deleteItemAsync).not.toHaveBeenCalled();
  await clearPendingCall(user, 41);
  expect(store.deleteItemAsync).toHaveBeenCalledWith(key);
});
