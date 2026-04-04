import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/theme';

interface AuthTabToggleProps {
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
}

/**
 * AuthTabToggle 컴포넌트
 * 로그인과 회원가입 탭을 전환하는 필(Pill) 형태의 토글 버튼.
 */
export default function AuthTabToggle({ activeTab, onTabChange }: AuthTabToggleProps) {
  const isLogin = activeTab === 'login';

  return (
    <View style={styles.container}>
      {/* Login Button Area */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onTabChange('login')}
        style={styles.tabWrapper}
      >
        {isLogin ? (
          <LinearGradient
            colors={Colors.gradient.cyanToPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeTab}
          >
            <Text style={styles.activeText}>로그인</Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveTab}>
            <Text style={styles.inactiveText}>로그인</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Signup Button Area */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onTabChange('signup')}
        style={styles.tabWrapper}
      >
        {!isLogin ? (
          <LinearGradient
            colors={Colors.gradient.cyanToPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeTab}
          >
            <Text style={styles.activeText}>회원가입</Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveTab}>
            <Text style={styles.inactiveText}>회원가입</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: 344.94,
    height: 53.2,
    padding: 4,
    borderRadius: 26.6, // Approximate for large round corner
    borderWidth: 0.612,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    width: 167.86,
    height: '100%',
    borderRadius: 20536500, // Explicit from spec
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveTab: {
    width: 167.86,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeText: {
    color: '#000',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  inactiveText: {
    color: '#99A1AF',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});
