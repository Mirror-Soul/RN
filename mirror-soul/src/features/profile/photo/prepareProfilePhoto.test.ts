import { requireOptionalNativeModule } from 'expo';
import { ImageManipulator } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { assertPhotoEditorAvailable, normalizeSelectedPhoto, prepareProfilePhoto, rotateSelectedPhoto } from './prepareProfilePhoto';

jest.mock('expo', () => ({ requireOptionalNativeModule: jest.fn() }));
jest.mock('expo-image-manipulator', () => ({ ImageManipulator: { manipulate: jest.fn() }, SaveFormat: { JPEG: 'jpeg' } }));
jest.mock('expo-file-system/legacy', () => ({ getInfoAsync: jest.fn(), deleteAsync: jest.fn() }));

const source = 'file:///photo.heic';
const output = { uri: 'file:///prepared.jpg', width: 1600, height: 2048 };
const decoded = { width: 3200, height: 4096, release: jest.fn() };
const rendered = { ...output, saveAsync: jest.fn(), release: jest.fn() };
const context = { renderAsync: jest.fn(), resize: jest.fn(), crop: jest.fn(), rotate: jest.fn(), release: jest.fn() };

beforeEach(() => {
  jest.resetAllMocks();
  (requireOptionalNativeModule as jest.Mock).mockReturnValue({ manipulate: jest.fn() });
  (ImageManipulator.manipulate as jest.Mock).mockReturnValue(context);
  context.resize.mockReturnValue(context);
  context.crop.mockReturnValue(context);
  rendered.saveAsync.mockResolvedValue(output);
  (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, isDirectory: false, size: 50000 });
  (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);
});

it.each([null, {}, { manipulateAsync: jest.fn() }])('handles an absent or incompatible native editor (%p) without dereferencing it', async native => {
  (requireOptionalNativeModule as jest.Mock).mockReturnValue(native);
  await expect(assertPhotoEditorAvailable()).rejects.toThrow('앱을 업데이트');
  await expect(normalizeSelectedPhoto(source)).rejects.toThrow('앱을 업데이트');
  expect(ImageManipulator.manipulate).not.toHaveBeenCalled();
});

it('uses decoded dimensions to resize and save a real JPEG, then releases native images', async () => {
  context.renderAsync.mockResolvedValueOnce(decoded).mockResolvedValueOnce(rendered);
  await expect(normalizeSelectedPhoto(source)).resolves.toEqual(output);
  expect(context.resize).toHaveBeenCalledWith({ width: 1600, height: 2048 });
  expect(rendered.saveAsync).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.95 });
  expect(decoded.release).toHaveBeenCalledTimes(1);
  expect(rendered.release).toHaveBeenCalledTimes(1);
  expect(context.release).toHaveBeenCalledTimes(1);
});

it('handles an empty decoder result without accessing width on undefined', async () => {
  context.renderAsync.mockResolvedValue(undefined);
  await expect(normalizeSelectedPhoto(source)).rejects.toThrow('다른 사진을 선택');
  expect(context.resize).not.toHaveBeenCalled();
  expect(context.release).toHaveBeenCalledTimes(1);
});

it('releases the context if decoding fails', async () => {
  context.renderAsync.mockRejectedValue(new Error('decoder failed'));
  await expect(normalizeSelectedPhoto(source)).rejects.toThrow('decoder failed');
  expect(context.release).toHaveBeenCalledTimes(1);
});

it('crops before resizing and retries compression when the generated file is too large', async () => {
  const crop = { originX: 100, originY: 0, width: 1600, height: 2000 };
  context.renderAsync.mockResolvedValue(rendered);
  rendered.saveAsync.mockResolvedValueOnce({ ...output, uri: 'file:///large.jpg' }).mockResolvedValueOnce(output);
  (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true, size: 6 * 1024 * 1024 }).mockResolvedValueOnce({ exists: true, size: 50000 });
  await expect(prepareProfilePhoto(source, crop)).resolves.toEqual({ ...output, size: 50000 });
  expect(context.crop).toHaveBeenCalledWith(crop);
  expect(context.resize).toHaveBeenCalledWith({ width: 1280 });
  expect(context.crop.mock.invocationCallOrder[0]).toBeLessThan(context.resize.mock.invocationCallOrder[0]);
  expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file:///large.jpg', { idempotent: true });
  expect(rendered.saveAsync).toHaveBeenLastCalledWith({ format: 'jpeg', compress: 0.65 });
  expect(rendered.release).toHaveBeenCalledTimes(1);
  expect(context.release).toHaveBeenCalledTimes(1);
});

it('rotates the original image before decoding and releases native references', async () => {
  const rotated = { ...output, width: 2048, height: 1600 };
  context.renderAsync.mockResolvedValue(rendered);
  rendered.saveAsync.mockResolvedValue(rotated);
  await expect(rotateSelectedPhoto(source, 90)).resolves.toEqual(rotated);
  expect(ImageManipulator.manipulate).toHaveBeenCalledWith(source);
  expect(context.rotate).toHaveBeenCalledWith(90);
  expect(context.rotate.mock.invocationCallOrder[0]).toBeLessThan(context.renderAsync.mock.invocationCallOrder[0]);
  expect(rendered.release).toHaveBeenCalledTimes(1);
  expect(context.release).toHaveBeenCalledTimes(1);
});

it('releases the native context on rotation failure', async () => {
  context.rotate.mockImplementationOnce(() => { throw new Error('rotate failed'); });
  await expect(rotateSelectedPhoto(source, 90)).rejects.toThrow('rotate failed');
  expect(context.release).toHaveBeenCalledTimes(1);
});
