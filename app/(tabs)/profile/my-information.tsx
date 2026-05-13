import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NavBar } from '../../../src/components/profile/NavBar';
import { WoodPortrait } from '../../../src/components/profile/WoodPortrait';
import { InfoField } from '../../../src/components/profile/InfoField';
import { SaveButton } from '../../../src/components/profile/SaveButton';
import {
  PersonIcon,
  EnvelopeIcon,
  PhoneIcon,
  CupcakeIcon,
  PinIcon,
} from '../../../src/components/profile/glyphs';
import { WheelPicker } from '../../../src/components/onboarding/WheelPicker';
import { useProfileStore, splitName } from '../../../src/stores/profileStore';
import { formatBirthdayDisplay } from '../../../src/lib/formatBirthday';
import { COPY } from '../../../src/constants/profileCopy';
import {
  OB_COLORS,
  OB_FONTS,
  OB_SPACING,
  OB_RADII,
  OB_BORDERS,
  OB_SHADOWS,
} from '../../../src/constants/onboardingTheme';

// ─── Local helpers ────────────────────────────────────────────────────────────

function combineName(first: string | null, last: string | null): string {
  return `${first ?? ''} ${last ?? ''}`.trim();
}

function isoFromParts(month: number, day: number, year: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function partsFromIso(iso: string): { month: number; day: number; year: number } | null {
  if (!iso) return null;
  const parts = iso.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

function defaultPickerDate(): { month: number; day: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    day: now.getDate(),
    year: now.getFullYear() - 30,
  };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MyInformationScreen() {
  const router = useRouter();
  const store = useProfileStore();
  const { loaded, draft, isLoading, isSaving } = store;

  // Local name state: single combined string for the NAME field
  const [nameInput, setNameInput] = useState('');
  // Birthday modal visibility
  const [birthdayModalOpen, setBirthdayModalOpen] = useState(false);
  // Picker temp state — only committed on "Done"
  const [pickerMonth, setPickerMonth] = useState(defaultPickerDate().month);
  const [pickerDay, setPickerDay] = useState(defaultPickerDate().day);
  const [pickerYear, setPickerYear] = useState(defaultPickerDate().year);

  // Load profile data on mount
  useEffect(() => {
    useProfileStore.getState().loadFromAuthAndProfile();
  }, []);

  // Sync nameInput from draft when draft first becomes available
  useEffect(() => {
    if (draft && nameInput === '') {
      setNameInput(combineName(draft.first_name, draft.last_name));
    }
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  // Discard draft on unmount
  useEffect(() => {
    return () => {
      useProfileStore.getState().discardDraft();
    };
  }, []);

  // Guard — must have draft to render form
  const nameIsEmpty = nameInput.trim() === '';
  const saveDisabled = isSaving || nameIsEmpty;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleNameChange(text: string) {
    setNameInput(text);
    const { first, last } = splitName(text);
    store.setDraftField('first_name', first);
    store.setDraftField('last_name', last);
  }

  function handleAvatarPress() {
    Alert.alert(
      COPY.MY_INFO_AVATAR_COMING_SOON_TITLE,
      COPY.MY_INFO_AVATAR_COMING_SOON_BODY,
    );
  }

  function handleBirthdayFieldPress() {
    // Pre-populate picker from current draft value
    const existing = draft?.birthday ? partsFromIso(draft.birthday) : null;
    if (existing) {
      setPickerMonth(existing.month);
      setPickerDay(existing.day);
      setPickerYear(existing.year);
    } else {
      const def = defaultPickerDate();
      setPickerMonth(def.month);
      setPickerDay(def.day);
      setPickerYear(def.year);
    }
    setBirthdayModalOpen(true);
  }

  function handleBirthdayConfirm() {
    const iso = isoFromParts(pickerMonth, pickerDay, pickerYear);
    store.setDraftField('birthday', iso);
    setBirthdayModalOpen(false);
  }

  function handleBirthdayCancel() {
    setBirthdayModalOpen(false);
  }

  async function handleSave() {
    const result = await store.save();
    if (result.success) {
      Alert.alert(
        COPY.MY_INFO_SAVE_SUCCESS_TITLE,
        COPY.MY_INFO_SAVE_SUCCESS_BODY,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } else {
      Alert.alert(
        COPY.MY_INFO_SAVE_ERROR_TITLE,
        result.error ?? COPY.MY_INFO_SAVE_ERROR_BODY,
      );
    }
  }

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (isLoading || !draft) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title={COPY.MY_INFO_TITLE} onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={OB_COLORS.cta} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────────────────

  const birthdayDisplay = draft.birthday
    ? formatBirthdayDisplay(draft.birthday)
    : '';

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar title={COPY.MY_INFO_TITLE} onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar row */}
          <View style={styles.avatarRow}>
            <View accessibilityRole="none">
              <WoodPortrait
                size={76}
                avatar={loaded?.avatar_url ?? null}
                testID="my-info-avatar"
              />
              {/* Pencil pill overlay */}
              <Pressable
                style={styles.pencilPill}
                onPress={handleAvatarPress}
                accessibilityRole="button"
                accessibilityLabel="Edit profile photo"
                hitSlop={8}
              >
                <Text style={styles.pencilText}>{'✎'}</Text>
              </Pressable>
            </View>
          </View>

          {/* Fields */}
          <View style={styles.fieldsContainer}>
            <InfoField
              label={COPY.MY_INFO_NAME_LABEL}
              value={nameInput}
              icon={<PersonIcon size={20} />}
              editable
              onChangeText={handleNameChange}
              placeholder={COPY.MY_INFO_NAME_PLACEHOLDER}
              autoCapitalize="words"
            />

            <InfoField
              label={COPY.MY_INFO_EMAIL_LABEL}
              value={draft.email}
              icon={<EnvelopeIcon size={20} />}
              editable={false}
              disabled
            />

            <InfoField
              label={COPY.MY_INFO_PHONE_LABEL}
              value={draft.phone}
              icon={<PhoneIcon size={20} />}
              editable
              onChangeText={(text) => store.setDraftField('phone', text)}
              placeholder={COPY.MY_INFO_PHONE_PLACEHOLDER}
              keyboardType="phone-pad"
            />

            <InfoField
              label={COPY.MY_INFO_BIRTHDAY_LABEL}
              value={birthdayDisplay}
              icon={<CupcakeIcon size={20} />}
              editable={false}
              onPress={handleBirthdayFieldPress}
              placeholder={COPY.MY_INFO_BIRTHDAY_PLACEHOLDER}
            />

            <InfoField
              label={COPY.MY_INFO_LOCATION_LABEL}
              value={draft.location}
              icon={<PinIcon size={20} />}
              editable
              onChangeText={(text) => store.setDraftField('location', text)}
              placeholder={COPY.MY_INFO_LOCATION_PLACEHOLDER}
              autoCapitalize="words"
            />
          </View>

          {/* Save button */}
          <View style={styles.saveContainer}>
            <SaveButton
              label={COPY.MY_INFO_SAVE_BUTTON}
              onPress={handleSave}
              disabled={saveDisabled}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Birthday modal */}
      <Modal
        visible={birthdayModalOpen}
        transparent
        animationType="slide"
        onRequestClose={handleBirthdayCancel}
        accessibilityViewIsModal
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Pressable
                onPress={handleBirthdayCancel}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                hitSlop={12}
              >
                <Text style={styles.modalActionText}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>{COPY.MY_INFO_BIRTHDAY_LABEL}</Text>
              <Pressable
                onPress={handleBirthdayConfirm}
                accessibilityRole="button"
                accessibilityLabel="Done"
                hitSlop={12}
              >
                <Text style={[styles.modalActionText, styles.modalActionDone]}>Done</Text>
              </Pressable>
            </View>
            <View style={styles.pickerContainer}>
              <WheelPicker
                month={pickerMonth}
                day={pickerDay}
                year={pickerYear}
                onChangeMonth={setPickerMonth}
                onChangeDay={setPickerDay}
                onChangeYear={setPickerYear}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: OB_COLORS.cream,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: OB_SPACING.screenPaddingH,
    paddingTop: OB_SPACING.mt4,
    paddingBottom: OB_SPACING.screenPaddingBottom + 24,
  },
  avatarRow: {
    alignItems: 'center',
    marginBottom: OB_SPACING.sectionGap,
  },
  pencilPill: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: OB_COLORS.cta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    ...OB_SHADOWS.card,
  },
  pencilText: {
    fontSize: 12,
    color: OB_COLORS.ctaText,
    lineHeight: 14,
  },
  fieldsContainer: {
    gap: OB_SPACING.mt3,
    marginBottom: OB_SPACING.sectionGap,
  },
  saveContainer: {
    marginTop: 'auto',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 20, 15, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: OB_COLORS.cream,
    borderTopLeftRadius: OB_RADII.modal,
    borderTopRightRadius: OB_RADII.modal,
    paddingHorizontal: OB_SPACING.screenPaddingH,
    paddingBottom: OB_SPACING.screenPaddingBottom + 16,
    paddingTop: OB_SPACING.mt2,
    borderTopWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: OB_SPACING.gap4,
  },
  modalTitle: {
    fontFamily: OB_FONTS.h2,
    fontSize: 15,
    color: OB_COLORS.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalActionText: {
    fontFamily: OB_FONTS.cta,
    fontSize: 15,
    color: OB_COLORS.muted,
  },
  modalActionDone: {
    color: OB_COLORS.cta,
  },
  pickerContainer: {
    paddingHorizontal: OB_SPACING.mt2,
  },
});
