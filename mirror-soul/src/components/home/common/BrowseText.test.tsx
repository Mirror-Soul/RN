import React from 'react';
import { render } from '@testing-library/react-native';
import { isLoaded } from 'expo-font';
import { BrowseText } from './BrowseText';
import { BrowseFontFamily } from '@/src/constants/browseFonts';

jest.mock('expo-font', () => ({ isLoaded: jest.fn() }));
const mockIsLoaded = jest.mocked(isLoaded);

it('keeps text readable in the original font if custom font loading fails', () => {
  mockIsLoaded.mockReturnValue(false);
  const screen = render(<BrowseText style={{ fontFamily: 'Inter', fontWeight: '500' }}>안녕하세요 MirrorSoul</BrowseText>);
  expect(screen.getByText('안녕하세요 MirrorSoul')).toHaveStyle({ fontFamily: 'Inter', fontWeight: '500' });
});

it.each([
  ['400', BrowseFontFamily.regular],
  ['500', BrowseFontFamily.medium],
  ['600', BrowseFontFamily.semibold],
  ['bold', BrowseFontFamily.semibold],
] as const)('uses the loaded %s face without synthetic bolding', (weight, fontFamily) => {
  mockIsLoaded.mockReturnValue(true);
  const screen = render(<BrowseText style={{ fontWeight: weight }}>프로필</BrowseText>);
  expect(screen.getByText('프로필')).toHaveStyle({ fontFamily, fontWeight: 'normal' });
});

it.each([['500', BrowseFontFamily.heading], ['600', BrowseFontFamily.headingBold]] as const)(
  'uses the actual rounded heading font for weight %s', (fontWeight, fontFamily) => {
    mockIsLoaded.mockReturnValue(true);
    const screen = render(<BrowseText variant="heading" style={{ fontWeight }}>발견</BrowseText>);
    expect(screen.getByText('발견')).toHaveStyle({ fontFamily, fontWeight: 'normal' });
  },
);

it('keeps headings readable when the rounded font is unavailable', () => {
  mockIsLoaded.mockReturnValue(false);
  const screen = render(<BrowseText variant="heading" style={{ fontFamily: 'Inter', fontWeight: '500' }}>발견</BrowseText>);
  expect(screen.getByText('발견')).toHaveStyle({ fontFamily: 'Inter', fontWeight: '500' });
});
