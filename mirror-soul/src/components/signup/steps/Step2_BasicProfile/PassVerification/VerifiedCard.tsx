import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/theme';
import VerificationSuccessIcon from '@/assets/images/common/Verification_sucess.svg';
import VerifiedDataBox from './VerifiedDataBox';

interface UserData {
  name: string;
  age: string;
  birth: string;
}

interface Props {
  userData: UserData;
}

export default function VerifiedCard({ userData }: Props) {
  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={[Colors.glass.green10, 'rgba(0, 211, 243, 0.10)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
      />
      
      {/* Header Info */}
      <View style={styles.headerRow}>
        <View style={styles.iconWrapper}>
          <VerificationSuccessIcon width={24} height={24} />
        </View>
        <View style={styles.titleCol}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>본인인증 완료</Text>
            <View style={styles.badgeWrapper}>
              <Text style={styles.badgeText}>Verified</Text>
            </View>
          </View>
          <Text style={styles.descriptionText}>PASS 본인인증이 완료되었습니다</Text>
        </View>
      </View>

      {/* Data Grid */}
      <View style={styles.dataGrid}>
        <View style={styles.rowWrapper}>
          <VerifiedDataBox label="이름" value={userData.name} style={styles.halfBox} />
          <VerifiedDataBox label="나이" value={userData.age} style={styles.halfBox} />
        </View>
        <VerifiedDataBox label="생년월일" value={userData.birth} style={styles.fullBox} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 0.612,
    borderColor: Colors.glass.cyan20,
    paddingTop: 24.6,
    paddingHorizontal: 24.6,
    paddingBottom: 24.6, 
    alignItems: 'flex-start',
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.glass.green20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleCol: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    color: Colors.neutral.pureWhite,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 27,
    letterSpacing: -0.439,
  },
  badgeWrapper: {
    paddingVertical: 2.6,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: Colors.glass.green20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.primary.successGreen,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  descriptionText: {
    color: Colors.neutral.lightGray,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  dataGrid: {
    width: '100%',
    flexDirection: 'column',
    gap: 12, 
  },
  rowWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12, 
  },
  halfBox: {
    flex: 1,
  },
  fullBox: {
    width: '100%',
  }
});
