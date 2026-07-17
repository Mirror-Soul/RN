import React from 'react';
import { StyleSheet, View } from 'react-native';
import Step2BasicProfileContainer from '@/src/components/signup/steps/Step2_BasicProfile/Step2BasicProfileContainer';
import { Colors } from '@/src/constants/theme';


/**
 * BasicProfileScreen (Step 2)
 * 닉네임, 지역, 직업 정보를 입력받는 화면입니다.
 * 모든 로직은 Step2BasicProfileContainer 내부에 캡슐화되어 있습니다.
 */
export default function BasicProfileScreen() {
  return (
    <View style={styles.container}>
      <Step2BasicProfileContainer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  }
});


