import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTabFocusAnimation } from '../../src/hooks/useTabFocusAnimation';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/stores/authStore';
import { useDogStore } from '../../src/stores/dogStore';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';
import { useTriageStore } from '../../src/stores/triageStore';
import { useCheckInStore } from '../../src/stores/checkInStore';
import { useHealthStore } from '../../src/stores/healthStore';
import { useLearnStore } from '../../src/stores/learnStore';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../../src/constants/theme';
import { LEGAL } from '../../src/constants/config';

const TAB_BAR_HEIGHT = 100;

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
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textDisabled} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const focusStyle = useTabFocusAnimation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const updateAvatar = useAuthStore((s) => s.updateAvatar);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { dogs } = useDogStore();
  const clearDogs = useDogStore((s) => s.clearDogs);
  const clearAll = useTriageStore((s) => s.clearAll);
  const clearCheckIn = useCheckInStore((s) => s.clearAll);
  const clearHealth = useHealthStore((s) => s.clearHealth);
  const clearLearn = useLearnStore((s) => s.clearLearn);
  const clearSubscription = useSubscriptionStore((s) => s.clearSubscription);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [firstName, setFirstName] = useState((user?.user_metadata?.first_name as string) ?? '');
  const [lastName, setLastName] = useState((user?.user_metadata?.last_name as string) ?? '');
  const [isSavingName, setIsSavingName] = useState(false);

  // Sync local state when user metadata changes (e.g. after save)
  useEffect(() => {
    setFirstName((user?.user_metadata?.first_name as string) ?? '');
    setLastName((user?.user_metadata?.last_name as string) ?? '');
  }, [user?.user_metadata?.first_name, user?.user_metadata?.last_name]);

  const storedFirst = (user?.user_metadata?.first_name as string) ?? '';
  const storedLast = (user?.user_metadata?.last_name as string) ?? '';
  const nameChanged = firstName.trim() !== storedFirst || lastName.trim() !== storedLast;

  const handleSaveName = async () => {
    setIsSavingName(true);
    try {
      await updateProfile({ first_name: firstName.trim(), last_name: lastName.trim() });
    } catch (err: any) {
      Alert.alert('Save Failed', err.message ?? 'Could not update name.');
    } finally {
      setIsSavingName(false);
    }
  };

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const userInitial = (firstName?.[0] ?? user?.email?.[0])?.toUpperCase() ?? '?';

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please allow photo access to set a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    setIsUploadingAvatar(true);
    try {
      await updateAvatar(result.assets[0].uri);
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message ?? 'Could not update profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    clearDogs();
    clearAll();
    clearCheckIn();
    clearHealth();
    clearLearn();
    clearSubscription();
    await signOut();
  };

  return (
    <Animated.View style={[{ flex: 1 }, focusStyle]}>
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_HEIGHT }]}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <Pressable
            onPress={handlePickAvatar}
            disabled={isUploadingAvatar}
            accessibilityRole="button"
            accessibilityLabel="Change profile picture"
            style={styles.profileAvatarWrapper}
          >
            <View style={styles.profileAvatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.profileAvatarImage} />
              ) : (
                <Text style={styles.profileAvatarText}>{userInitial}</Text>
              )}
            </View>
            <View style={styles.cameraOverlay}>
              {isUploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons name="camera" size={14} color="#FFFFFF" />
              )}
            </View>
          </Pressable>
          <Pressable onPress={handlePickAvatar} disabled={isUploadingAvatar}>
            <Text style={styles.changePhotoText}>
              {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
            </Text>
          </Pressable>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={[styles.card, SHADOWS.card]}>
          <View style={styles.nameRow}>
            <Text style={styles.nameLabel}>First Name</Text>
            <TextInput
              style={styles.nameInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={COLORS.textDisabled}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              accessibilityLabel="First name"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.nameRow}>
            <Text style={styles.nameLabel}>Last Name</Text>
            <TextInput
              style={styles.nameInput}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={COLORS.textDisabled}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={nameChanged ? handleSaveName : undefined}
              accessibilityLabel="Last name"
            />
          </View>
          {nameChanged && (
            <>
              <View style={styles.separator} />
              <Pressable
                style={({ pressed }) => [styles.settingsRow, pressed && styles.rowPressed]}
                onPress={handleSaveName}
                disabled={isSavingName}
                accessibilityRole="button"
                accessibilityLabel="Save name"
              >
                {isSavingName ? (
                  <ActivityIndicator size="small" color={COLORS.accent} />
                ) : (
                  <Text style={styles.saveNameText}>Save</Text>
                )}
              </Pressable>
            </>
          )}
          <View style={styles.separator} />
          <SettingsRow label="Email" value={user?.email ?? ''} />
          <View style={styles.separator} />
          <SettingsRow
            label="Change Password"
            onPress={() => router.push('/change-password')}
          />
        </View>

        {/* Dogs Section */}
        <Text style={styles.sectionHeader}>Dogs</Text>
        <View style={[styles.card, SHADOWS.card]}>
          {dogs.length === 0 ? (
            <SettingsRow label="No dogs added" />
          ) : (
            dogs.map((dog, index) => (
              <View key={dog.id}>
                {index > 0 && <View style={styles.separator} />}
                <Pressable
                  style={({ pressed }) => [styles.dogRow, pressed && styles.rowPressed]}
                  onPress={() => router.push({ pathname: '/edit-dog', params: { id: dog.id } })}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${dog.name}`}
                >
                  <View style={styles.dogAvatar}>
                    <MaterialCommunityIcons name="paw" size={16} color={COLORS.accent} />
                  </View>
                  <View style={styles.dogInfo}>
                    <Text style={styles.dogName}>{dog.name}</Text>
                    <Text style={styles.dogBreed}>{dog.breed} · {dog.age_years}y</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textDisabled} />
                </Pressable>
              </View>
            ))
          )}
          <View style={styles.separator} />
          <Pressable
            style={({ pressed }) => [styles.settingsRow, pressed && styles.rowPressed]}
            onPress={() => router.push('/add-dog')}
            accessibilityRole="button"
            accessibilityLabel="Add a new dog"
          >
            <Text style={styles.addDogText}>Add Dog</Text>
          </Pressable>
        </View>

        {/* Legal Section */}
        <Text style={styles.sectionHeader}>Legal</Text>
        <View style={[styles.card, SHADOWS.card]}>
          <View style={styles.legalContent}>
            <Text style={styles.legalText}>
              PupLog provides educational information only. It is not a
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
        <View style={[styles.card, SHADOWS.card]}>
          <SettingsRow label="Version" value="1.0.0" />
        </View>

        {/* Sign Out */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            SHADOWS.subtle,
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  pageTitle: {
    fontFamily: FONTS.heading,
    fontSize: 34,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
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
    borderRadius: BORDER_RADIUS.xl,
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
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.divider,
    marginLeft: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
  },
  nameLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    width: 100,
  },
  nameInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    textAlign: 'right',
    padding: 0,
  },
  saveNameText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.accent,
    fontWeight: '600',
  },
  dogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    minHeight: 56,
  },
  dogAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  dogInfo: {
    flex: 1,
  },
  dogName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dogBreed: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  addDogText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.accent,
    fontWeight: '600',
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
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
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
    borderRadius: BORDER_RADIUS.xl,
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
  profileSection: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  profileAvatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileAvatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  changePhotoText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
