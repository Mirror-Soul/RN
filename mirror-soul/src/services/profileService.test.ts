import apiClient from './apiClient';
import {
  buyTime,
  deleteAccount,
  getAccountInfo,
  getAlarmSetting,
  getAudioSettings,
  getMyProfile,
  getMyTime,
  modifyAlarmSetting,
  modifyNickname,
  updateAudioSettings,
} from './profileService';

// babel-plugin-jest-hoist가 이 호출을 파일 최상단(import보다 위)으로 끌어올려주므로
// 실행 순서상 문제는 없다 — import/first 린트 규칙과의 충돌을 피하려고 물리적 위치만 아래에 둔다.
jest.mock('./apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  patch: jest.Mock;
  delete: jest.Mock;
};

const okResponse = <T>(result: T) => ({
  data: { isSuccess: true, code: 'COMMON2000', message: 'ok', result, error: null },
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('profileService', () => {
  it('getMyProfile calls GET /my-page', async () => {
    mockedApiClient.get.mockResolvedValueOnce(okResponse({ name: '김소울', email: 'a@b.com' }));
    const response = await getMyProfile();
    expect(mockedApiClient.get).toHaveBeenCalledWith('/my-page');
    expect(response.result.name).toBe('김소울');
  });

  it('getMyTime calls GET /my-page/buy-time', async () => {
    mockedApiClient.get.mockResolvedValueOnce(
      okResponse({ remainingTalkTime: 100, hours: 0, minutes: 1, seconds: 40 })
    );
    await getMyTime();
    expect(mockedApiClient.get).toHaveBeenCalledWith('/my-page/buy-time');
  });

  it('buyTime posts { buyTime: seconds } to /my-page/buy-time', async () => {
    mockedApiClient.post.mockResolvedValueOnce(
      okResponse({ remainingTalkTime: 1800, hours: 0, minutes: 30, seconds: 0 })
    );
    await buyTime(1800);
    expect(mockedApiClient.post).toHaveBeenCalledWith('/my-page/buy-time', { buyTime: 1800 });
  });

  it('getAudioSettings calls GET /my-page/audio-settings', async () => {
    mockedApiClient.get.mockResolvedValueOnce(
      okResponse({ opponentVoiceVolume: 50, opponentSpeechSpeed: 'NORMAL' })
    );
    await getAudioSettings();
    expect(mockedApiClient.get).toHaveBeenCalledWith('/my-page/audio-settings');
  });

  it('updateAudioSettings patches the given payload to /my-page/audio-settings', async () => {
    const payload = { opponentVoiceVolume: 80, opponentSpeechSpeed: 'FAST' as const };
    mockedApiClient.patch.mockResolvedValueOnce(okResponse(payload));
    await updateAudioSettings(payload);
    expect(mockedApiClient.patch).toHaveBeenCalledWith('/my-page/audio-settings', payload);
  });

  it('getAlarmSetting calls GET /my-page/alarm', async () => {
    mockedApiClient.get.mockResolvedValueOnce(
      okResponse({ missedCallNotificationEnabled: true, lowTimeNotificationEnabled: true })
    );
    await getAlarmSetting();
    expect(mockedApiClient.get).toHaveBeenCalledWith('/my-page/alarm');
  });

  it('modifyAlarmSetting patches the given payload to /my-page/alarm', async () => {
    const payload = { missedCallNotificationEnabled: false, lowTimeNotificationEnabled: true };
    mockedApiClient.patch.mockResolvedValueOnce(okResponse(payload));
    await modifyAlarmSetting(payload);
    expect(mockedApiClient.patch).toHaveBeenCalledWith('/my-page/alarm', payload);
  });

  it('getAccountInfo calls GET /my-page/account', async () => {
    mockedApiClient.get.mockResolvedValueOnce(okResponse({ name: '김소울' }));
    await getAccountInfo();
    expect(mockedApiClient.get).toHaveBeenCalledWith('/my-page/account');
  });

  it('modifyNickname posts { nickname } to /my-page/account', async () => {
    mockedApiClient.post.mockResolvedValueOnce(okResponse(null));
    await modifyNickname('새닉네임');
    expect(mockedApiClient.post).toHaveBeenCalledWith('/my-page/account', { nickname: '새닉네임' });
  });

  it('deleteAccount calls DELETE /my-page', async () => {
    mockedApiClient.delete.mockResolvedValueOnce(okResponse(null));
    await deleteAccount();
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/my-page');
  });

  it('rethrows errors from apiClient so callers can handle them', async () => {
    const apiError = { code: 'USER_NOT_FOUND', message: '존재하지 않는 사용자입니다.' };
    mockedApiClient.get.mockRejectedValueOnce(apiError);
    await expect(getMyProfile()).rejects.toEqual(apiError);
  });
});
