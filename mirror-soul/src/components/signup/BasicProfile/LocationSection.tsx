import LocationIcon from '@/assets/images/common/Location.svg';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ProfileSectionTitle from './ProfileSectionTitle';
import SelectDropdown from './SelectDropdown';

export default function LocationSection() {
  return (
    <View style={styles.container}>
      <ProfileSectionTitle
        title="Location"
        icon={<LocationIcon width={24} height={24} />}
      />
      <SelectDropdown
        label="Your Location"
        placeholder="Select your location"
        onPress={() => console.log('Location dropdown pressed')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 40,
  }
});
