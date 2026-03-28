import { Colors } from '@/src/constants/theme';
import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { jobCategories } from './jobData';

interface Props {
  onSelect: (category: string) => void;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function JobCategoryDropdown({ onSelect, onClose }: Props) {
  const handleSelect = (job: string) => {
    onSelect(job);
    onClose(); // 선택 완료 후 명시적으로 닫기 호출
  };

  return (
    <View style={styles.overlayContainer}>
      {/* 바깥 영역 터치 시 닫기를 위한 투명 백드롭 */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.dropdownPanel}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {jobCategories.map((job) => (
            <TouchableOpacity
              key={job}
              style={styles.listItem}
              activeOpacity={0.6}
              onPress={() => handleSelect(job)}
            >
              <Text style={styles.listItemText}>{job}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: -SCREEN_HEIGHT, // 상단 영역까지 덮기 위해 위로 크게 확장
    left: -100,
    right: -100,
    height: SCREEN_HEIGHT * 2,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  dropdownPanel: {
    marginTop: SCREEN_HEIGHT + 80,
    marginHorizontal: 100,
    maxHeight: 240,
    padding: 8.607,
    flexDirection: 'column',
    borderRadius: 16,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.slate95,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 4,
  },
  listItem: {
    width: '100%',
    height: 48,
    paddingVertical: 11.4,
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: 'center',
  },
  listItemText: {
    color: Colors.neutral.pureWhite,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.312,
  }
});
