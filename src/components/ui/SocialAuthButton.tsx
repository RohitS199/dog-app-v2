import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';

interface SocialAuthButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  loading?: boolean;
}

const PROVIDER_CONFIG = {
  google: {
    icon: 'google' as const,
    label: 'Continue with Google',
    iconColor: '#4285F4',
  },
  apple: {
    icon: 'apple' as const,
    label: 'Continue with Apple',
    iconColor: '#000000',
  },
};

export function SocialAuthButton({ provider, onPress, loading = false }: SocialAuthButtonProps) {
  const config = PROVIDER_CONFIG[provider];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && !loading && styles.pressed,
        loading && styles.loading,
      ]}
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={config.label}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.textPrimary} />
      ) : (
        <View style={styles.content}>
          <MaterialCommunityIcons
            name={config.icon}
            size={20}
            color={config.iconColor}
            style={styles.icon}
          />
          <Text style={styles.label}>{config.label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xxl,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    minHeight: MIN_TOUCH_TARGET,
    backgroundColor: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
  loading: {
    opacity: 0.7,
  },
});
