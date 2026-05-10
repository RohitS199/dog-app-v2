import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
} from '../../constants/onboardingTheme';
import { COPY } from '../../constants/profileCopy';
import { PillButton } from './PillButton';

interface LogOutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  dogName?: string;
}

export function LogOutModal({ visible, onConfirm, onCancel, dogName }: LogOutModalProps) {
  const body = dogName
    ? COPY.PROFILE_LOGOUT_BODY_TEMPLATE(dogName)
    : COPY.PROFILE_LOGOUT_BODY_FALLBACK;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={styles.backdrop}
        onPress={onCancel}
        accessibilityLabel="Close log out modal"
        accessibilityRole="button"
      />
      <View style={styles.cardWrap} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.heading}>{COPY.PROFILE_LOGOUT_HEADING}</Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.btnRow}>
            <PillButton label={COPY.PROFILE_LOGOUT_CONFIRM} variant="primary" onPress={onConfirm} />
            <View style={styles.btnGap} />
            <PillButton label={COPY.PROFILE_LOGOUT_CANCEL} variant="ghost" onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 20, 15, 0.4)',
  },
  cardWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: OB_COLORS.cream,
    borderRadius: OB_RADII.modal,
    borderWidth: 2.5,
    borderColor: OB_COLORS.sketch,
    paddingHorizontal: 20,
    paddingVertical: 18,
    ...OB_SHADOWS.button,
  },
  heading: {
    textAlign: 'center',
    fontFamily: OB_FONTS.h1,
    fontSize: 22,
    color: OB_COLORS.ink,
    marginBottom: 8,
  },
  body: {
    textAlign: 'center',
    fontFamily: OB_FONTS.body,
    fontSize: 13,
    color: OB_COLORS.ink2,
    marginBottom: 14,
  },
  btnRow: {
    flexDirection: 'column',
  },
  btnGap: {
    height: 8,
  },
});
