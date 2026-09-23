// Discovery 탐색 지역 화면(discovery-region-settings.tsx)의 MapView는 항상
// provider={PROVIDER_GOOGLE}을 쓴다. 이 두 키가 없으면 android는 지도에 필요한
// API 키 메타데이터 자체가 빠져 빈 회색 타일만 보인다(Android Maps SDK의 잘 알려진 동작) —
// iOS의 Apple Maps 자동 폴백 여부와 무관하게 Android는 확정적으로 깨진다. 빌드를 막지는
// 않되(다른 작업 중인 기여자가 이 키 없이도 작업할 수 있어야 하므로), 놓치기 쉬운 문제라
// 터미널에 눈에 띄게 경고한다.
if (!process.env.GOOGLE_MAPS_IOS_API_KEY || !process.env.GOOGLE_MAPS_ANDROID_API_KEY) {
  console.warn(
    '[app.config.js] GOOGLE_MAPS_IOS_API_KEY/GOOGLE_MAPS_ANDROID_API_KEY가 .env에 설정되지 않았습니다. ' +
      'Discovery 탐색 지역 화면의 지도가 Android에서는 빈 회색 타일로, iOS에서는 예상과 다르게 표시될 수 있습니다. ' +
      '.env.example을 참고해 .env에 두 키를 채워주세요.'
  );
}

module.exports = {
  expo: {
    name: 'mirror-soul',
    slug: 'mirror-soul',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'mirrorsoul',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/REPLACE_WITH_EAS_PROJECT_ID',
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSSpeechRecognitionUsageDescription: 'Mirror Soul에서 실시간 음성 인식을 위해 권한이 필요합니다.',
        NSMicrophoneUsageDescription: 'Mirror Soul에서 음성 인터뷰를 위해 마이크 접근이 필요합니다.',
        NSCameraUsageDescription: 'Mirror Soul에서 3D 얼굴 스캔을 위해 카메라 접근이 필요합니다.',
      },
      bundleIdentifier: 'com.mirrorsoul64.app',
      privacyManifests: {
        NSPrivacyCollectedDataTypes: [
          {
            NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeAudioData',
            NSPrivacyCollectedDataTypeLinked: true,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
          },
          {
            NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePhotosorVideos',
            NSPrivacyCollectedDataTypeLinked: true,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
          },
        ],
        NSPrivacyAccessedAPITypes: [],
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ['android.permission.RECORD_AUDIO', 'android.permission.MODIFY_AUDIO_SETTINGS', 'android.permission.CAMERA'],
      package: 'com.mirrorsoul64.app',
      googleServicesFile: './google-services.json',
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      'expo-audio',
      [
        'expo-speech-recognition',
        {
          microphonePermission: 'Mirror Soul에서 음성 인터뷰를 위해 마이크 접근이 필요합니다.',
          speechRecognitionPermission: 'Mirror Soul에서 실시간 음성 인식을 위해 권한이 필요합니다.',
        },
      ],
      [
        'react-native-vision-camera',
        {
          cameraPermissionText: 'Mirror Soul에서 3D 얼굴 스캔을 위해 카메라 접근이 필요합니다.',
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '15.5',
          },
          android: {
            minSdkVersion: 26,
          },
        },
      ],
      // Google Maps API 키는 .env(gitignore 대상)에서만 읽는다 — app.json이었을 때는 이 값이
      // git에 그대로 커밋됐을 것이다. 키가 없으면 undefined가 되어 이 플러그인이 iOS엔
      // GoogleMaps pod/AppDelegate 초기화 코드를 아예 안 넣고, android엔 지도 API 키
      // 메타데이터를 지운다(react-native-maps/plugin/build/{ios,android}.js 직접 확인,
      // v1.29.2 기준) — 파일 상단의 경고 참고.
      [
        'react-native-maps',
        {
          iosGoogleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY,
          androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
        },
      ],
      [
        'expo-location',
        {
          locationWhenInUsePermission: 'Mirror Soul에서 현재 위치로 탐색 지역을 설정하기 위해 위치 접근이 필요합니다.',
        },
      ],
      'expo-secure-store',
      './plugins/withDisableIOSPushEntitlement',
      'expo-notifications',
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/Inter_400Regular.ttf',
            './assets/fonts/Inter_500Medium.ttf',
            './assets/fonts/Inter_600SemiBold.ttf',
            './assets/fonts/Inter_700Bold.ttf',
            './assets/fonts/Inter_900Black.ttf',
          ],
        },
      ],
      '@sentry/react-native',
      './plugins/withSentryDisableAutoUpload',
      'expo-web-browser',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: 'REPLACE_WITH_EAS_PROJECT_ID',
      },
    },
  },
};
