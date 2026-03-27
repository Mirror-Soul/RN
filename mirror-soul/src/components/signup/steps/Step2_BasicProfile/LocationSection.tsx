import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import StepSectionTitle from '../../common/StepSectionTitle';
import StepSelectDropdown from '../../common/StepSelectDropdown';
import LocationIcon from '@/assets/images/common/Location.svg';
import LocationDropdown from './Location/LocationDropdown';

export default function LocationSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');

  return (
    <View style={[styles.container, isOpen && styles.containerOpen]}>
      <StepSectionTitle 
        title="Location" 
        icon={<LocationIcon width={24} height={24} />} 
      />
      <StepSelectDropdown 
        label="Your Location"
        placeholder={selectedLocation || "Select your location"}
        onPress={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
      />
      
      {isOpen && (
        <LocationDropdown 
          onSelect={(city) => {
            setSelectedLocation(city);
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
    marginBottom: 40,
    position: 'relative',
    // iOS/Android 모두에서 하위 컴포넌트(ProfessionalSection 등)를 덮을 수 있도록 zIndex 제어
    ...(Platform.OS === 'ios' ? { zIndex: 1 } : { elevation: 1 }),
  },
  containerOpen: {
    // Dropdown이 열렸을 때 가장 상위에 오도록 zIndex 극대화
    ...(Platform.OS === 'ios' ? { zIndex: 100 } : { elevation: 100 }),
  }
});
