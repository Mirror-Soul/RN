const { withEntitlementsPlist } = require('expo/config-plugins');

// 무료(개인) Apple 개발자 계정은 Push Notifications capability(aps-environment entitlement)를
// 지원하지 않아서, expo-notifications 플러그인이 iOS에 이 entitlement를 추가해두면 실기기
// 서명이 "Personal development teams... do not support the Push Notifications capability"로
// 항상 실패한다. 지금은 Android만 지원하기로 했고(iOS는 유료 Apple Developer Program 등록
// 후 진행 예정) app.json plugins 배열에서 expo-notifications보다 뒤에 두어, 그 플러그인이
// 추가한 entitlement를 iOS에서만 제거한다. 유료 계정으로 iOS 푸시를 시작하면 이 플러그인을
// app.json에서 제거할 것.
const withDisableIOSPushEntitlement = (config) => {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};

module.exports = withDisableIOSPushEntitlement;
