import React from 'react';
import { AccountActionSheet } from './AccountActionSheet';

export const DeleteConfirmBottomSheet = ({ isOpen, isConfirming = false, onClose, onConfirm }: { isOpen: boolean; isConfirming?: boolean; onClose: () => void; onConfirm: () => void }) => (
  <AccountActionSheet visible={isOpen} title="회원 탈퇴를 진행할까요?" description={'계정이 즉시 비활성화돼요.\n탈퇴 후 30일이 지나기 전에 로그인하면 복구할 수 있어요.\n복구 기간이 지나면 계정을 다시 사용할 수 없어요.'} action="탈퇴하기" cancel="계정 유지하기" busy={isConfirming} danger onClose={onClose} onConfirm={onConfirm} />
);
