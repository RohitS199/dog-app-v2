import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { OB_BORDERS, OB_COLORS, OB_FONTS, OB_RADII } from '../../constants/onboardingTheme';

interface InfoFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  editable?: boolean;
  disabled?: boolean;
  onChangeText?: (next: string) => void;
  onPress?: () => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function InfoField({
  label,
  value,
  icon,
  editable,
  disabled,
  onChangeText,
  onPress,
  placeholder,
  keyboardType,
  autoCapitalize,
}: InfoFieldProps) {
  const [focused, setFocused] = useState(false);

  const Wrapper: React.ComponentType<any> = onPress && !editable ? Pressable : View;
  const wrapperProps = onPress && !editable
    ? { onPress, accessibilityRole: 'button', accessibilityLabel: label }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      style={[
        styles.container,
        focused && styles.focused,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.stack}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {editable ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={OB_COLORS.muted}
            editable={!disabled}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            accessibilityLabel={label}
          />
        ) : (
          <Text style={styles.value} numberOfLines={1}>
            {value || '—'}
          </Text>
        )}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: OB_RADII.field,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
  },
  focused: {
    borderColor: OB_COLORS.cta,
    borderWidth: 2,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stack: { flex: 1 },
  label: {
    fontFamily: OB_FONTS.dataLabel,
    fontSize: 9,
    color: OB_COLORS.ink2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontFamily: OB_FONTS.dataValue,
    fontSize: 14,
    color: OB_COLORS.ink,
    marginTop: 2,
  },
  input: {
    fontFamily: OB_FONTS.dataValue,
    fontSize: 14,
    color: OB_COLORS.ink,
    marginTop: 2,
    padding: 0,
  },
});
