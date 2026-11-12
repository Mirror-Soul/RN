import React from 'react';
import { render } from '@testing-library/react-native';
import { ProfileJobBadge } from './ProfileJobBadge';
import { toPublicProfilePreview } from '../photo/toPublicProfile';
import { introductionPreview } from '../constants/introductionPreview';
jest.mock('@/src/components/home/common/BrowseIcon', () => ({ BrowseIcon: () => null }));
jest.mock('@/src/components/home/common/BrowseText', () => ({ BrowseText: jest.requireActual('react-native').Text }));
jest.mock('@/src/features/match/components/MatchingDesign', () => ({ useMatchingDesign: () => ({ palette: {} }) }));
it('uses explicit server approval for the document label and never calls it final verification', () => {
  const view = render(<ProfileJobBadge job="IT_TECH" documentReviewed />);
  expect(view.getByText('직업 서류 확인')).toBeTruthy();
  expect(view.queryByText('직업 인증 완료')).toBeNull();
  view.rerender(<ProfileJobBadge job="IT_TECH" />);
  expect(view.queryByText('직업 서류 확인')).toBeNull();
});
it('maps the document review flag to both public previews and hides private submission state', () => {
  const { match, detail } = toPublicProfilePreview({ ...introductionPreview, jobCertificationSubmitted: true, jobDocumentReviewCompleted: true });
  expect(match.jobDocumentReviewCompleted).toBe(true); expect(detail.jobDocumentReviewCompleted).toBe(true);
  expect(match.jobCertificationSubmitted).toBe(false); expect(detail.jobCertificationSubmitted).toBe(false);
});
