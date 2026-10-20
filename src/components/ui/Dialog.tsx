import React from 'react';
import { Modal } from './Modal';
import type { ModalProps } from './Modal';

export interface DialogProps extends ModalProps {}

export const Dialog: React.FC<DialogProps> = (props) => {
  return <Modal {...props} />;
};
