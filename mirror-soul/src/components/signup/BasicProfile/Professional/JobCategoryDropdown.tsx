import { Colors } from '@/src/constants/theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { jobCategories } from './jobData';

interface Props {
  onSelect: (category: string) => void;
  onClose: () => void;
}

export default function JobCategoryDropdown({ onSelect, onClose }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {jobCategories.map((job) => (
          <TouchableOpacity
            key={job}
            style={styles.listItem}
            activeOpacity={0.6}
            onPress={() => onSelect(job)}
          >
            <Text style={styles.listItemText}>{job}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80, // SelectDropdown 버튼 바로 아래 위치하도록 조절 (Label 포함 높이 고려)
    left: 0,
    right: 0,
    maxHeight: 240,
    padding: 8.607,
    flexDirection: 'column',
    borderRadius: 16,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.slate95,
    zIndex: 100,
    elevation: 10,
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
