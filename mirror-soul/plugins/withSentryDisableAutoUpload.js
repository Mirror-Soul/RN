const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

// 아직 실제 Sentry organization/project가 없는 로컬 개발 빌드에서
// sentry-cli 소스맵·디버그심볼 자동 업로드가 실패해 전체 빌드가 막히는 것을 방지합니다.
// 실제 Sentry 프로젝트를 연동하면 이 플러그인은 app.json plugins 배열에서 제거하세요.
const withSentryDisableAutoUpload = (config) => {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const xcodeEnvLocalPath = path.join(config.modRequest.platformProjectRoot, '.xcode.env.local');
      const line = 'export SENTRY_DISABLE_AUTO_UPLOAD=true\n';
      const existing = fs.existsSync(xcodeEnvLocalPath) ? fs.readFileSync(xcodeEnvLocalPath, 'utf8') : '';
      if (!existing.includes('SENTRY_DISABLE_AUTO_UPLOAD')) {
        fs.appendFileSync(xcodeEnvLocalPath, line);
      }
      return config;
    },
  ]);
};

module.exports = withSentryDisableAutoUpload;
