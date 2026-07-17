import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {Colors, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
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
        colors={[Colors.glass.green10, Colors.glass.cyan10_d3]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: Radii.lg }]}
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
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.cyan20,
    paddingTop: 24.6,
    paddingHorizontal: 24.6,
    paddingBottom: 24.6, 
    alignItems: 'flex-start',
    gap: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    width: '100%',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Radii.xl,
    backgroundColor: Colors.glass.green20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleCol: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  titleText: {
    color: Colors.neutral.pureWhite,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    lineHeight: 27,
    letterSpacing: -0.439,
  },
  badgeWrapper: {
    paddingVertical: 2.6,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.lg2,
    backgroundColor: Colors.glass.green20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.primary.successGreen,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 16,
  },
  descriptionText: {
    color: Colors.neutral.lightGray,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  dataGrid: {
    width: '100%',
    flexDirection: 'column',
    gap: Spacing.md, 
  },
  rowWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md, 
  },
  halfBox: {
    flex: 1,
  },
  fullBox: {
    width: '100%',
  }
});
