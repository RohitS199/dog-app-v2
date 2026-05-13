import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NavBar } from '../../../../src/components/profile/NavBar';
import { RowItem } from '../../../../src/components/profile/RowItem';
import { BellGlyph, LockGlyph, HeartGlyph } from '../../../../src/components/profile/glyphs';
import { StickerIcon } from '../../../../src/components/profile/StickerIcon';
import { COPY } from '../../../../src/constants/profileCopy';
import { OB_COLORS, OB_SPACING } from '../../../../src/constants/onboardingTheme';

export default function SettingsHubScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar
        title={COPY.SETTINGS_TITLE}
        onBackPress={() => router.back()}
      />
      <View style={styles.body}>
        <RowItem
          label={COPY.SETTINGS_NAV_NOTIFICATIONS}
          icon={<BellGlyph size={22} />}
          onPress={() => router.push('/profile/settings/notifications')}
        />
        <RowItem
          label={COPY.SETTINGS_NAV_SECURITY}
          icon={<LockGlyph size={22} />}
          onPress={() => router.push('/profile/settings/security')}
        />
        <RowItem
          label={COPY.SETTINGS_NAV_HELP_CENTER}
          icon={<HeartGlyph size={22} />}
          onPress={() => router.push('/profile/settings/help-center')}
        />
        <RowItem
          label={COPY.SETTINGS_NAV_ABOUT}
          icon={<StickerIcon char="P" />}
          onPress={() => router.push('/profile/settings/about')}
        />
        <RowItem
          label={COPY.SETTINGS_NAV_PRIVACY}
          icon={<StickerIcon char={'§'} />}
          onPress={() => router.push('/profile/settings/privacy')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: OB_COLORS.cream,
  },
  body: {
    flex: 1,
    paddingHorizontal: OB_SPACING.screenPaddingH,
    paddingTop: OB_SPACING.mt4,
    gap: OB_SPACING.gap3,
  },
});
