# Mirror Soul Design System Tokens Guide

Design Platform Team에서 제공하는 전역 디자인 토큰 및 공통 컴포넌트 사용 가이드입니다. 
앱 전반에 걸쳐 하드코딩된 값(매직 넘버/스트링)을 피하고 이 가이드에 명시된 토큰을 사용하여 통일성 있는 UX/DX를 유지해 주세요.

## 1. 계층 구조 이해하기

Mirror Soul의 토큰은 **Primitive**와 **Semantic** 2계층으로 나뉩니다.

### 🎨 Primitive Tokens (`Colors`, `FontFamily`, `Radii`, `Layout`)
고정된 원시값들입니다. 다크/라이트 모드에 따라 변하지 **않는** 브랜드 고유의 색상이나 절대적인 간격, 둥글기 등을 의미합니다.
*   사용처: 아이콘 색상, 브랜드 그라디언트, 특정 모드에 구애받지 않는 배지 등.

```tsx
import { Colors, FontFamily, Radii } from '@/src/constants/theme';

// ❌ 나쁜 예: 하드코딩 사용
<Text style={{ fontFamily: 'Inter', color: '#00D3F3' }}>
<View style={{ borderRadius: 16 }}>

// ✅ 좋은 예: Primitive Token 사용
<Text style={{ fontFamily: FontFamily.sans, color: Colors.primary.electricCyan }}>
<View style={{ borderRadius: Radii.lg }}>
```

### 🔤 Semantic Tokens (`ThemeColors`)
맥락(의미)에 따라 다크/라이트 모드에서 값이 **자동으로 변환**되는 색상들입니다. 배경색, 텍스트 색상, 테두리 색상 등을 지정할 때 반드시 사용해야 합니다.

```tsx
import { useThemeColors } from '@/src/hooks/useThemeColors';

const MyComponent = () => {
  const { colors } = useThemeColors();

  // ❌ 나쁜 예: 다크모드 대응 불가
  return <View style={{ backgroundColor: '#141414' }}>
  
  // ✅ 좋은 예: Semantic Token 사용
  return <View style={{ backgroundColor: colors.background.primary }}>
}
```

---

## 2. 공통 UI 컴포넌트 사용

자주 쓰이는 UI 패턴은 `src/components/common/` 하위에 추상화되어 있습니다. 기존에 반복 작성하던 레이아웃을 컴포넌트로 대체하세요.

### `<ThemeToggle />`
다크/라이트 모드를 전환하는 접근성 지원 스위치입니다.
```tsx
import { ThemeToggle } from '@/src/components/common/ThemeToggle';

<ThemeToggle size="md" showLabel={true} /> // 레이블이 있는 중간 사이즈
<ThemeToggle size="sm" /> // 작고 심플한 토글
```

### `<SectionHeading />`
고객센터, 설정, 섹션 헤더 등에 쓰이는 자간이 넓은 대문자 텍스트입니다.
```tsx
import { SectionHeading } from '@/src/components/common/SectionHeading';

// ❌ 직접 스타일 작성 시 폰트/간격 누락 위험
<Text style={{ fontFamily: 'Inter', fontSize: 12, letterSpacing: 0.6, color: 'gray' }}>설정</Text>

// ✅ 안전한 공통 컴포넌트
<SectionHeading title="설정" />
```

### `<Badge />`
크기, 색상, 아이콘을 유연하게 주입할 수 있는 알약(Pill) 형태의 뱃지입니다.
```tsx
import { Badge } from '@/src/components/common/Badge';

<Badge label="NEW" colorScheme="gold" variant="glass" size="sm" />
<Badge label="INTJ" colorScheme="purple" variant="solid" />
<Badge label="93%" colorScheme="cyan" variant="gradient" />
```

---

## 3. 원칙 요약 (DOs & DON'Ts)

1.  **NO Magic Strings:** `fontFamily: 'Inter'`를 절대 사용하지 마세요. 항상 `FontFamily.sans`를 사용합니다.
2.  **NO Hardcoded Colors for UI:** 배경, 텍스트, 보더에 `rgba(...)`나 `#Hex`를 직접 쓰지 마세요. `colors.background.*`, `colors.text.*`, `colors.border.*` 안에서 해답을 찾으세요.
3.  **Use `colors.state.danger`:** 에러나 삭제(회원 탈퇴 등) 텍스트는 `#FF4C4C` 대신 `colors.state.danger`를 씁니다.
4.  **Check `Radii`:** 모서리 둥글기가 필요하면 8, 12, 16 등을 직접 쓰기보다 `Radii.sm`, `Radii.md`, `Radii.lg`를 활용하세요.
