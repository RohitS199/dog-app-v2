import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NavBar } from '../../../../src/components/profile/NavBar';
import { COPY } from '../../../../src/constants/profileCopy';
import { OB_COLORS, OB_FONTS } from '../../../../src/constants/onboardingTheme';

// Placeholder — the follow-up subagent replaces the body with the real screen.
export default function SecurityScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <NavBar
        title={COPY.SETTINGS_NAV_SECURITY}
        onBackPress={() => router.back()}
      />
      <View style={styles.body}>
        <Text style={styles.placeholder}>{COPY.SETTINGS_SECURITY_PLACEHOLDER}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    fontFamily: OB_FONTS.h1,
    fontSize: 30,
    color: OB_COLORS.ink,
  },
});
