import FormLabel from '@/src/components/signup/common/FormLabel';
import StepSelectDropdown from '@/src/components/signup/common/StepSelectDropdown';
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import LocationDropdown from '../Location/LocationDropdown';
import { SectionProps } from '../types/step2';

interface LocationSectionProps extends SectionProps {
  sigunguCache: React.MutableRefObject<Map<string, string[]>>;
  eupmyeondongCache: React.MutableRefObject<Map<string, string[]>>;
}

/**
 * LocationSection 컴포넌트 (SRP)
 * 지역 선택 드롭다운을 렌더링하며, 한글로 직관적인 UI를 제공합니다.
 */
export default function LocationSection({ state, onChange, sigunguCache, eupmyeondongCache }: LocationSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={[styles.container, isOpen && styles.containerOpen]}>
      <FormLabel label="지역" />

      <View style={styles.dropdownWrapper}>
        <StepSelectDropdown
          label="" // Subtitle 제거를 위해 빈 라벨
          placeholder={
            state.sidoName 
              ? `${state.sidoName} ${state.sigunguName} ${state.eupmyeondongName}`
              : "거주 중인 지역을 선택하세요"
          }
          onPress={() => setIsOpen(!isOpen)}
          isOpen={isOpen}
          style={styles.dropdown}
        />

        {isOpen && (
          <LocationDropdown
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    ...(Platform.OS === 'ios' ? { zIndex: 10 } : { elevation: 10 }),
  },
  containerOpen: {
    ...(Platform.OS === 'ios' ? { zIndex: 100 } : { elevation: 100 }),
  },
  dropdownWrapper: {
    position: 'relative',
    width: '100%',
  },
  dropdown: {
    marginTop: 0,
  }
});
