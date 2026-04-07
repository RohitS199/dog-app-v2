import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  MIN_TOUCH_TARGET,
} from '../../constants/theme';
import { DOG_BREEDS } from '../../constants/dogBreeds';

interface BreedPickerProps {
  value: string;
  onChangeText: (text: string) => void;
  accessibilityLabel?: string;
}

const MAX_SUGGESTIONS = 6;

export function BreedPicker({ value, onChangeText, accessibilityLabel }: BreedPickerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 0,
      useNativeDriver: false,
    }).start();
  }, [borderAnim]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding so tap on suggestion registers before blur
    setTimeout(() => setShowSuggestions(false), 150);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [borderAnim]);

  const handleSelect = useCallback(
    (breed: string) => {
      onChangeText(breed);
      setShowSuggestions(false);
      Keyboard.dismiss();
    },
    [onChangeText],
  );

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', COLORS.accent],
  });

  // Filter breeds by typed text (case-insensitive, match anywhere in name)
  const query = value.trim().toLowerCase();
  const filtered =
    query.length === 0
      ? DOG_BREEDS
      : DOG_BREEDS.filter((b) => b.toLowerCase().includes(query));

  // Prioritize breeds that START with the query, then contains
  const sorted =
    query.length === 0
      ? filtered
      : [
          ...filtered.filter((b) => b.toLowerCase().startsWith(query)),
          ...filtered.filter((b) => !b.toLowerCase().startsWith(query)),
        ];

  const suggestions = sorted.slice(0, MAX_SUGGESTIONS);
  const exactMatch = DOG_BREEDS.some((b) => b.toLowerCase() === query);

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, { borderColor: animatedBorderColor }]}>
        <MaterialCommunityIcons
          name="dog"
          size={20}
          color={isFocused ? COLORS.accent : COLORS.textDisabled}
          style={styles.icon}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={(t) => {
            onChangeText(t);
            if (!showSuggestions) setShowSuggestions(true);
          }}
          placeholder="Breed (e.g., Golden Retriever)"
          placeholderTextColor={COLORS.textDisabled}
          autoCapitalize="words"
          autoCorrect={false}
          accessibilityLabel={accessibilityLabel ?? "Dog's breed"}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {value.length > 0 && (
          <Pressable
            onPress={() => {
              onChangeText('');
              inputRef.current?.focus();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear breed"
          >
            <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.textDisabled} />
          </Pressable>
        )}
      </Animated.View>

      {showSuggestions && isFocused && !exactMatch && suggestions.length > 0 && (
        <ScrollView
          style={styles.dropdown}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {suggestions.map((item) => {
            const idx = item.toLowerCase().indexOf(query);
            return (
              <Pressable
                key={item}
                style={({ pressed }) => [
                  styles.suggestion,
                  pressed && styles.suggestionPressed,
                ]}
                onPress={() => handleSelect(item)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${item}`}
              >
                {query.length > 0 && idx >= 0 ? (
                  <Text style={styles.suggestionText}>
                    {item.slice(0, idx)}
                    <Text style={styles.suggestionHighlight}>
                      {item.slice(idx, idx + query.length)}
                    </Text>
                    {item.slice(idx + query.length)}
                  </Text>
                ) : (
                  <Text style={styles.suggestionText}>{item}</Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.sm,
    zIndex: 10,
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
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    paddingVertical: 12,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4,
    maxHeight: 250,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  suggestion: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  suggestionPressed: {
    backgroundColor: COLORS.accentLight,
  },
  suggestionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  suggestionHighlight: {
    color: COLORS.accent,
    fontWeight: '600',
  },
});
