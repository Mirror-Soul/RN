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
      // git에 그대로 커밋됐을 것이다. 키가 없으면(.env 미설정) undefined가 되어 플러그인이
      // 자동으로 Apple Maps 기본 프로바이더로 폴백한다(react-native-maps/plugin/build/ios.js 참고).
      [
        'react-native-maps',
        {
          iosGoogleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY,
          androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
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
