import FormLabel from '@/src/components/signup/common/FormLabel';
import StepSelectDropdown from '@/src/components/signup/common/StepSelectDropdown';
import { useDropdownAnchor } from '@/src/components/signup/common/useDropdownAnchor';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LocationDropdown from '../Location/LocationDropdown';
import { SectionProps } from '../types/step2';
import { Spacing } from '@/src/constants/theme';


interface LocationSectionProps extends SectionProps {
  sigunguCache: React.RefObject<Map<string, string[]>>;
  eupmyeondongCache: React.RefObject<Map<string, string[]>>;
}

/**
 * LocationSection 컴포넌트 (SRP)
 * 지역 선택 드롭다운을 렌더링하며, 한글로 직관적인 UI를 제공합니다.
 */
export default function LocationSection({ state, onChange, sigunguCache, eupmyeondongCache }: LocationSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { triggerRef, anchor, measureAndOpen } = useDropdownAnchor();

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      measureAndOpen(() => setIsOpen(true));
    }
  };

  return (
    <View style={styles.container}>
      <FormLabel label="지역" />

      <View style={styles.dropdownWrapper} ref={triggerRef}>
        <StepSelectDropdown
          label="" // Subtitle 제거를 위해 빈 라벨
          placeholder={
            state.sidoName
              ? `${state.sidoName} ${state.sigunguName} ${state.eupmyeondongName}`
              : "거주 중인 지역을 선택하세요"
          }
          onPress={handleToggle}
          isOpen={isOpen}
          style={styles.dropdown}
        />
      </View>

      {isOpen && anchor && (
        <LocationDropdown
          anchor={anchor}
          sigunguCache={sigunguCache}
          eupmyeondongCache={eupmyeondongCache}
          onSelect={(result) => {
            onChange({
              sidoName: result.sidoName,
              sigunguName: result.sigunguName,
              eupmyeondongName: result.eupmyeondongName
            });
            setIsOpen(false);
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dropdownWrapper: {
    width: '100%',
  },
  dropdown: {
    marginTop: Spacing.none,
  }
});
