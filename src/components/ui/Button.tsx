import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET, SHADOWS } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger-outline';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: 'arrow-right' | 'check';
};

const VARIANT_STYLES: Record<ButtonVariant, {
  bg: string;
  text: string;
  borderColor?: string;
  borderWidth?: number;
}> = {
  primary: { bg: COLORS.accent, text: '#FFFFFF' },
  secondary: { bg: COLORS.primary, text: '#FFFFFF' },
  outline: { bg: 'transparent', text: COLORS.primary, borderColor: COLORS.primary, borderWidth: 1.5 },
  'danger-outline': { bg: 'transparent', text: COLORS.error, borderColor: COLORS.error, borderWidth: 1.5 },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
}: ButtonProps) {
  const vs = VARIANT_STYLES[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: vs.bg },
        vs.borderColor ? { borderColor: vs.borderColor, borderWidth: vs.borderWidth } : undefined,
        variant === 'primary' && SHADOWS.subtle,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.text} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.text, { color: vs.text }]}>{title}</Text>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={vs.text}
              style={styles.icon}
            />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.xxl,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  icon: {
    marginLeft: SPACING.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
