import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authStore';
import { useDogStore } from '../../src/stores/dogStore';
import { useTriageStore } from '../../src/stores/triageStore';
import { useCheckInStore } from '../../src/stores/checkInStore';
import { useHealthStore } from '../../src/stores/healthStore';
import { useLearnStore } from '../../src/stores/learnStore';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../src/constants/theme';
import { LEGAL } from '../../src/constants/config';

function SettingsRow({
  label,
  value,
  onPress,
  destructive,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsRow,
        pressed && onPress && styles.rowPressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={onPress ? `${label}${value ? `, ${value}` : ''}` : undefined}
    >
      <Text
        style={[styles.rowLabel, destructive && styles.destructiveLabel]}
      >
        {label}
      </Text>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : onPress ? (
        <Text style={styles.rowArrow} accessibilityElementsHidden>→</Text>
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { dogs } = useDogStore();
  const clearDogs = useDogStore((s) => s.clearDogs);
  const clearAll = useTriageStore((s) => s.clearAll);
  const clearCheckIn = useCheckInStore((s) => s.clearAll);
  const clearHealth = useHealthStore((s) => s.clearHealth);
  const clearLearn = useLearnStore((s) => s.clearLearn);

  const handleSignOut = async () => {
    clearDogs();
    clearAll();
    clearCheckIn();
    clearHealth();
    clearLearn();
    await signOut();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Account Section */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.card}>
          <SettingsRow label="Email" value={user?.email ?? ''} />
          <View style={styles.separator} />
          <SettingsRow
            label="Change Password"
            onPress={() => router.push('/change-password')}
          />
        </View>

        {/* Dogs Section */}
        <Text style={styles.sectionHeader}>Dogs</Text>
        <View style={styles.card}>
          {dogs.length === 0 ? (
            <SettingsRow label="No dogs added" />
          ) : (
            dogs.map((dog, index) => (
              <View key={dog.id}>
                {index > 0 && <View style={styles.separator} />}
                <SettingsRow
                  label={dog.name}
                  value={`${dog.breed} · ${dog.age_years}y`}
                  onPress={() =>
                    router.push({ pathname: '/edit-dog', params: { id: dog.id } })
                  }
                />
              </View>
            ))
          )}
          <View style={styles.separator} />
          <SettingsRow
            label="Add Dog"
            onPress={() => router.push('/add-dog')}
          />
        </View>

        {/* Legal Section */}
        <Text style={styles.sectionHeader}>Legal</Text>
        <View style={styles.card}>
          <View style={styles.legalContent}>
            <Text style={styles.legalText}>
              PawCheck provides educational information only. It is not a
              substitute for professional veterinary advice, diagnosis, or
              treatment.
            </Text>
            <Text style={styles.legalVersion}>
              Terms version: {LEGAL.TERMS_VERSION}
            </Text>
          </View>
        </View>

        {/* About Section */}
        <Text style={styles.sectionHeader}>About</Text>
        <View style={styles.card}>
          <SettingsRow label="Version" value="1.0.0" />
        </View>

        {/* Sign Out */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        {/* Delete Account */}
        <Pressable
          style={({ pressed }) => [
            styles.deleteAccountButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/delete-account')}
          accessibilityRole="button"
          accessibilityLabel="Delete account"
        >
          <Text style={styles.deleteAccountText}>Delete Account</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionHeader: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    marginLeft: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
  },
  rowPressed: {
    backgroundColor: COLORS.divider,
  },
  rowLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  destructiveLabel: {
    color: COLORS.error,
  },
  rowValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    maxWidth: '50%',
    textAlign: 'right',
  },
  rowArrow: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDisabled,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.divider,
    marginLeft: SPACING.md,
  },
  legalContent: {
    padding: SPACING.md,
  },
  legalText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  legalVersion: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
    marginTop: SPACING.sm,
  },
  signOutButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  signOutText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  deleteAccountButton: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  deleteAccountText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
  },
});
