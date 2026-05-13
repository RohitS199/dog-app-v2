import React, { useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NavBar } from '../../../../src/components/profile/NavBar';
import { RowItem } from '../../../../src/components/profile/RowItem';
import { HELP_FAQS, HELP_SUPPORT_EMAIL, HelpFaq } from '../../../../src/constants/helpFaqs';
import { COPY } from '../../../../src/constants/profileCopy';
import {
  OB_BORDERS,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
  OB_SPACING,
} from '../../../../src/constants/onboardingTheme';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HelpCenterScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [sheetFaq, setSheetFaq] = useState<HelpFaq | null>(null);

  // ─── Filtering ─────────────────────────────────────────────────────────────

  const filtered = HELP_FAQS.filter((faq) =>
    faq.title.toLowerCase().includes(query.toLowerCase()),
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleFaqPress(faq: HelpFaq) {
    const { destination } = faq;
    if (destination.type === 'route') {
      router.push(destination.href as Parameters<typeof router.push>[0]);
    } else if (destination.type === 'sheet') {
      setSheetFaq(faq);
    } else if (destination.type === 'mailto') {
      const subject = encodeURIComponent(destination.subject);
      Linking.openURL(`mailto:${HELP_SUPPORT_EMAIL}?subject=${subject}`).catch(() => {});
    }
  }

  function handleEmailSupport() {
    const subject = encodeURIComponent(COPY.SETTINGS_HELP_CENTER_CONTACT_SUBJECT);
    Linking.openURL(`mailto:${HELP_SUPPORT_EMAIL}?subject=${subject}`).catch(() => {});
  }

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar title={COPY.SETTINGS_HELP_CENTER_TITLE} onBackPress={() => router.back()} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <TextInput
          style={styles.searchBar}
          placeholder={COPY.SETTINGS_HELP_CENTER_SEARCH_PLACEHOLDER}
          placeholderTextColor={OB_COLORS.muted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel={COPY.SETTINGS_HELP_CENTER_SEARCH_PLACEHOLDER}
        />

        {/* Section label */}
        <Text style={styles.sectionLabel}>
          {COPY.SETTINGS_HELP_CENTER_POPULAR_LABEL}
        </Text>

        {/* FAQ list */}
        {filtered.length === 0 ? (
          <Text style={styles.noMatches}>
            {COPY.SETTINGS_HELP_CENTER_NO_MATCHES}
          </Text>
        ) : (
          <View style={styles.rows}>
            {filtered.map((faq) => (
              <RowItem
                key={faq.id}
                label={faq.title}
                onPress={() => handleFaqPress(faq)}
              />
            ))}
          </View>
        )}

        {/* Contact card */}
        <View style={styles.contactCard}>
          <Text style={styles.contactHeading}>
            {COPY.SETTINGS_HELP_CENTER_CONTACT_HEADING}
          </Text>
          <Pressable
            onPress={handleEmailSupport}
            accessibilityRole="button"
            accessibilityLabel={COPY.SETTINGS_HELP_CENTER_CONTACT_BUTTON}
            style={({ pressed }) => [styles.contactBtn, pressed && styles.contactBtnPressed]}
          >
            <Text style={styles.contactBtnText}>
              {COPY.SETTINGS_HELP_CENTER_CONTACT_BUTTON}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom sheet modal for 'sheet' destination FAQs */}
      <Modal
        visible={sheetFaq !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetFaq(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSheetFaq(null)}
          accessibilityLabel="Close"
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.sheetTitle} numberOfLines={2}>
              {sheetFaq?.title}
            </Text>
            <Text style={styles.sheetBody}>
              {sheetFaq?.destination.type === 'sheet' ? sheetFaq.destination.body : ''}
            </Text>
            <Pressable
              onPress={() => setSheetFaq(null)}
              accessibilityRole="button"
              accessibilityLabel={COPY.SETTINGS_HELP_CENTER_SHEET_CLOSE}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.contactBtnPressed]}
            >
              <Text style={styles.closeBtnText}>
                {COPY.SETTINGS_HELP_CENTER_SHEET_CLOSE}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
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
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: OB_SPACING.screenPaddingH,
    paddingTop: OB_SPACING.mt4,
    paddingBottom: OB_SPACING.screenPaddingBottom + 24,
  },

  // Search bar
  searchBar: {
    height: 44,
    backgroundColor: OB_COLORS.peachSoft,
    borderRadius: OB_RADII.field,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    paddingHorizontal: 14,
    fontFamily: OB_FONTS.body,
    fontSize: 15,
    color: OB_COLORS.ink,
    marginBottom: OB_SPACING.gap4,
    ...OB_SHADOWS.card,
  },

  sectionLabel: {
    fontFamily: OB_FONTS.body,
    fontSize: 11,
    color: OB_COLORS.muted,
    letterSpacing: 0.8,
    marginBottom: OB_SPACING.mt2,
  },

  rows: {
    gap: OB_SPACING.gap3,
    marginBottom: OB_SPACING.gap4,
  },

  noMatches: {
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.muted,
    textAlign: 'center',
    paddingVertical: OB_SPACING.gap4,
    marginBottom: OB_SPACING.gap4,
  },

  // Contact card
  contactCard: {
    backgroundColor: OB_COLORS.peachSoft,
    borderRadius: 18,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    padding: OB_SPACING.cardPadding,
    alignItems: 'center',
    gap: OB_SPACING.mt3,
    ...OB_SHADOWS.card,
  },
  contactHeading: {
    fontFamily: OB_FONTS.h2,
    fontSize: 16,
    color: OB_COLORS.ink,
  },
  contactBtn: {
    backgroundColor: OB_COLORS.cta,
    borderRadius: OB_RADII.button,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  contactBtnPressed: {
    opacity: 0.8,
  },
  contactBtnText: {
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.ctaText,
  },

  // Bottom sheet modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: OB_COLORS.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    padding: OB_SPACING.cardPadding,
    gap: OB_SPACING.gap4,
  },
  sheetTitle: {
    fontFamily: OB_FONTS.h2,
    fontSize: 17,
    color: OB_COLORS.ink,
  },
  sheetBody: {
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.ink2,
    lineHeight: 22,
  },
  closeBtn: {
    alignSelf: 'center',
    backgroundColor: OB_COLORS.cta,
    borderRadius: OB_RADII.button,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  closeBtnText: {
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.ctaText,
  },
});
