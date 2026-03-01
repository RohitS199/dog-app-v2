import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET, FONTS } from '../../constants/theme';

type InputFieldProps = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  eyeToggle?: boolean;
  rightText?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  accessibilityLabel?: string;
  maxLength?: number;
  editable?: boolean;
};

export function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  eyeToggle,
  rightText,
  keyboardType,
  autoCapitalize,
  autoComplete,
  textContentType,
  accessibilityLabel,
  maxLength,
  editable = true,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          isFocused && styles.focused,
          error ? styles.errorBorder : undefined,
        ]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={error ? COLORS.error : isFocused ? COLORS.accent : COLORS.textDisabled}
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDisabled}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          accessibilityLabel={accessibilityLabel}
          maxLength={maxLength}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {eyeToggle && secureTextEntry && (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textDisabled}
            />
          </Pressable>
        )}
        {rightText && (
          <Text style={styles.rightText}>{rightText}</Text>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.sm,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: SPACING.md,
  },
  focused: {
    borderColor: COLORS.accent,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: SPACING.xs,
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDisabled,
    marginLeft: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    marginLeft: SPACING.md,
  },
});
