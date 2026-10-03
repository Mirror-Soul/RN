import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { CroppedPhotoPreview } from './CroppedPhotoPreview';

jest.mock('expo-image', () => ({ Image: jest.requireActual('react-native').Image }));
const photo = { uri: 'file:///original.jpg', width: 2000, height: 1000 };
const crop = { originX: 600, originY: 100, width: 400, height: 500 };

it('projects an off-center crop into a 4:3 card without reintroducing discarded pixels', () => {
  const screen = render(<CroppedPhotoPreview photo={photo} crop={crop} width={120} height={90} label="추천 카드" />);
  const image = screen.UNSAFE_getByType(Image);
  expect(image.props.source.uri).toBe(photo.uri);
  expect(StyleSheet.flatten(image.props.style)).toMatchObject({ width: 600, height: 300, left: -180, top: -60 });
});

it('centers the same crop in a circular avatar', () => {
  const screen = render(<CroppedPhotoPreview photo={photo} crop={crop} width={80} height={80} round label="원형 사진" />);
  expect(StyleSheet.flatten(screen.getByLabelText('원형 사진').props.style).borderRadius).toBe(40);
  expect(StyleSheet.flatten(screen.UNSAFE_getByType(Image).props.style)).toMatchObject({ width: 400, height: 200, left: -120, top: -30 });
});
