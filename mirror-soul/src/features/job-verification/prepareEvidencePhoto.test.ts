import { requireOptionalNativeModule } from 'expo';
import * as FileSystem from 'expo-file-system/legacy';
import { prepareEvidencePhoto } from './prepareEvidencePhoto';
const mockImage = { width: 2000, height: 3000, saveAsync: jest.fn(), release: jest.fn() };
const mockContext = { renderAsync: jest.fn(), resize: jest.fn(), crop: jest.fn(), release: jest.fn() };
jest.mock('expo', () => ({ requireOptionalNativeModule: jest.fn() }));
jest.mock('expo-image-manipulator', () => ({ ImageManipulator: { manipulate: () => mockContext }, SaveFormat: { JPEG: 'jpeg' } }));
jest.mock('expo-file-system/legacy', () => ({ getInfoAsync: jest.fn(), deleteAsync: jest.fn() }));
beforeEach(() => {
  jest.clearAllMocks(); (requireOptionalNativeModule as jest.Mock).mockReturnValue({ manipulate: () => {} });
  mockContext.renderAsync.mockResolvedValue(mockImage); mockImage.saveAsync.mockResolvedValue({ uri: 'file:///prepared.jpg', width: 2000, height: 3000 });
  (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, size: 50000, isDirectory: false });
  (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);
});
it('encodes actual JPEG without cropping the document and releases native objects', async () => {
  await expect(prepareEvidencePhoto('file:///original.heic')).resolves.toMatchObject({ uri: 'file:///prepared.jpg', size: 50000 });
  expect(mockImage.saveAsync).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.95 });
  expect(mockContext.crop).not.toHaveBeenCalled(); expect(mockContext.resize).not.toHaveBeenCalled();
  expect(mockImage.release).toHaveBeenCalled(); expect(mockContext.release).toHaveBeenCalled();
});
it('tries smaller JPEG encoding for files over the server limit', async () => {
  (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true, size: 6 * 1024 * 1024 }).mockResolvedValueOnce({ exists: true, size: 100000 });
  await prepareEvidencePhoto('file:///original.png');
  expect(mockImage.saveAsync).toHaveBeenCalledTimes(2);
  expect(FileSystem.deleteAsync).not.toHaveBeenCalledWith('file:///original.png', expect.anything());
});
it('gives a recoverable message when an older development build has no native editor', async () => {
  (requireOptionalNativeModule as jest.Mock).mockReturnValue(null);
  await expect(prepareEvidencePhoto('file:///one.jpg')).rejects.toThrow('업데이트');
  expect(mockContext.renderAsync).not.toHaveBeenCalled();
});
