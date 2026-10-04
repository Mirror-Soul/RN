import React from 'react';
import { AccountActionSheet } from './AccountActionSheet';

export const LogoutBottomSheet = ({ isOpen, isLoggingOut = false, onClose, onLogout }: { isOpen: boolean; isLoggingOut?: boolean; onClose: () => void; onLogout: () => void }) => (
  <AccountActionSheet visible={isOpen} title="로그아웃할까요?" description={'이 기기에서 로그아웃해요.\n계정과 남은 대화 시간은 유지돼요.\n다시 이용하려면 로그인해 주세요.'} action="로그아웃하기" cancel="계속 이용하기" busy={isLoggingOut} onClose={onClose} onConfirm={onLogout} />
);
