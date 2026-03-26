import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProfileSectionTitle from './ProfileSectionTitle';
import SelectDropdown from './SelectDropdown';
import CustomInput from '@/src/components/signup/common/CustomInput';
import { Colors } from '@/src/constants/theme';
import ProfessionalIcon from '@/assets/images/common/Professional.svg';
import Complete2Icon from '@/assets/images/common/Complete2.svg';
import VerifySendIcon from '@/assets/images/common/Verify_send.svg';

export default function ProfessionalSection() {
  return (
    <View style={styles.container}>
      <ProfileSectionTitle 
        title="Professional Information" 
        icon={<ProfessionalIcon width={24} height={24} />} 
      />
      
      <View style={styles.formGroup}>
        <SelectDropdown 
          label="Job Category"
          placeholder="Select your field"
          onPress={() => console.log('Job category pressed')}
        />
        
        <CustomInput 
          label="Job Title (Optional)"
          placeholder="e.g., Senior Product Designer"
        />

        {/* Verification Card */}
        <View style={styles.verifyCard}>
          <View style={styles.verifyHeaderRow}>
            
            <View style={styles.verifyHeaderLeft}>
              <Complete2Icon width={36} height={36} />
              <View style={styles.verifyTitleGroup}>
                <Text style={styles.verifyTitle}>Verify Your Profession</Text>
                <Text style={styles.verifySubtitle}>Optional but recommended</Text>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.8} style={styles.verifyButton}>
              <VerifySendIcon width={16} height={16} />
              <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
            
          </View>
          
          <Text style={styles.verifyDescription}>
            Upload a work ID or LinkedIn profile to verify. Verified profiles get 3x more quality matches.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 40,
  },
  formGroup: {
    width: '100%',
    gap: 24,
  },
  verifyCard: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
    gap: 12,
  },
  verifyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  verifyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyTitleGroup: {
    flexDirection: 'column',
  },
  verifyTitle: {
    color: Colors.neutral.pureWhite,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  verifySubtitle: {
    color: Colors.neutral.darkGray,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderRadius: 14,
    borderWidth: 0.612,
    borderColor: Colors.glass.purple30,
    backgroundColor: Colors.glass.purple20,
  },
  verifyButtonText: {
    color: Colors.primary.vividPurple,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  verifyDescription: {
    color: Colors.neutral.darkGray,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  }
});
