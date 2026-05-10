import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OB_COLORS, OB_FONTS } from '../../../src/constants/onboardingTheme';
import { COPY } from '../../../src/constants/profileCopy';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.placeholder}>{COPY.PROFILE_ROOT_PLACEHOLDER}</Text>
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
