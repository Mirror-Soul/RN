import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import StepSectionTitle from '../../common/StepSectionTitle';
import StepSelectDropdown from '../../common/StepSelectDropdown';
import CustomInput from '@/src/components/signup/common/CustomInput';
import { Colors } from '@/src/constants/theme';
import ProfessionalIcon from '@/assets/images/common/Professional.svg';
import Complete2Icon from '@/assets/images/common/Complete2.svg';
import VerifySendIcon from '@/assets/images/common/Verify_send.svg';
import JobCategoryDropdown from './Professional/JobCategoryDropdown';

export default function ProfessionalSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState('');

  return (
    <View style={[styles.container, isOpen && styles.containerOpen]}>
      <StepSectionTitle 
        title="Professional Information" 
        icon={<ProfessionalIcon width={24} height={24} />} 
      />
      
      <View style={styles.formGroup}>
        {/* 드롭다운이 오버레이될 수 있도록 relative 컨테이너 제공 */}
        <View style={styles.dropdownWrapper}>
          <StepSelectDropdown 
            label="Job Category"
            placeholder={selectedJob || "Select your field"}
            onPress={() => setIsOpen(!isOpen)}
            isOpen={isOpen}
          />
          {isOpen && (
            <JobCategoryDropdown 
              onSelect={(job) => {
                setSelectedJob(job);
                setIsOpen(false);
              }}
              onClose={() => setIsOpen(false)}
            />
          )}
        </View>
        
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
    ...(Platform.OS === 'ios' ? { zIndex: 1 } : { elevation: 1 }),
  },
  containerOpen: {
    ...(Platform.OS === 'ios' ? { zIndex: 100 } : { elevation: 100 }),
  },
  formGroup: {
    width: '100%',
    gap: 24,
  },
  dropdownWrapper: {
    position: 'relative',
    width: '100%',
    // iOS/Android 오버레이를 위해 zIndex를 강제 부여하여 Job Title Input을 덮도록 설정
    ...(Platform.OS === 'ios' ? { zIndex: 10 } : { elevation: 10 }),
  },
  verifyCard: {
    width: '100%',
    padding: 16,
    borderRadius: Radii.lg,
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
    borderRadius: Radii.md2,
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
