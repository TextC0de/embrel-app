import React from 'react';
import { Modal as RNModal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { BORDER_RADIUS, COLORS, createShadow, SPACING } from '../../constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  children: React.ReactNode;
  transparent?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  closeOnBackdrop = true,
  children,
  transparent = true,
}) => {
  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.content}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  content: {
    backgroundColor: COLORS.background.white,
    borderRadius: BORDER_RADIUS.lg,
    maxWidth: 400,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
    ...createShadow(4),
  },
}); 