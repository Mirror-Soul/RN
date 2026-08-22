const { withEntitlementsPlist } = require('expo/config-plugins');

// 무료(개인) Apple 개발자 계정은 Push Notifications capability(aps-environment entitlement)를
// 지원하지 않아서, expo-notifications 플러그인이 iOS에 이 entitlement를 추가해두면 실기기
// 서명이 "Personal development teams... do not support the Push Notifications capability"로
// 항상 실패한다. 지금은 Android만 지원하기로 했고(iOS는 유료 Apple Developer Program 등록
// 후 진행 예정) app.json plugins 배열에서 expo-notifications보다 반드시 앞에 둘 것 — Expo의
// mod 체이닝은 나중에 오는 플러그인의 action이 먼저 실행되고 그 결과를 앞쪽 플러그인에
// 넘기는 구조라(양파처럼 안쪽→바깥쪽), 앞쪽에 있어야 이 플러그인의 삭제가 expo-notifications의
// 추가보다 나중에 실행되어 최종적으로 이긴다. 뒤에 두면 삭제가 먼저(빈 entitlements에)
// 실행돼 아무 효과가 없고 그 다음 expo-notifications가 키를 추가해버린다 — 실제로 이 순서
// 실수로 한 번 실패해서 재확인함. 유료 계정으로 iOS 푸시를 시작하면 이 플러그인을
// app.json에서 제거할 것.
const withDisableIOSPushEntitlement = (config) => {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};

module.exports = withDisableIOSPushEntitlement;
