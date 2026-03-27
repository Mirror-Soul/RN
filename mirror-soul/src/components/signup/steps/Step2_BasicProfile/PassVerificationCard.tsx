import VerificationProtectIcon from '@/assets/images/common/Verification_protect_icon.svg';
import StepSectionTitle from '../../common/StepSectionTitle';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import UnverifiedCard from './PassVerification/UnverifiedCard';
import VerifiedCard from './PassVerification/VerifiedCard';

export default function PassVerificationCard() {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <View style={styles.wrapper}>
      <StepSectionTitle
        title="Identity Verification"
        icon={<VerificationProtectIcon width={24} height={24} />}
      />

      {isVerified ? (
        <VerifiedCard userData={{ name: '김철수', age: '29세', birth: '1995.03.15' }} />
      ) : (
        <UnverifiedCard onVerify={() => setIsVerified(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 40,
    marginTop: 24,
  }
});
