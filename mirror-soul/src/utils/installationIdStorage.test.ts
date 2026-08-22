import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { getOrCreateInstallationId } from './installationIdStorage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('getOrCreateInstallationId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the existing id without generating a new one when already stored', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('existing-uuid');

    const result = await getOrCreateInstallationId();

    expect(result).toBe('existing-uuid');
    expect(Crypto.randomUUID).not.toHaveBeenCalled();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it('generates and persists a new id when none is stored yet', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (Crypto.randomUUID as jest.Mock).mockReturnValue('fresh-uuid');

    const result = await getOrCreateInstallationId();

    expect(result).toBe('fresh-uuid');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('push_installation_id', 'fresh-uuid');
  });
});
