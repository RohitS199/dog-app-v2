import { Modal, Pressable, StyleSheet, Text, View, FlatList } from 'react-native';
import { useDogStore } from '../../stores/dogStore';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';
import type { Dog } from '../../types/api';

interface DogSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export function DogSelector({ visible, onClose }: DogSelectorProps) {
  const { dogs, selectedDogId, selectDog } = useDogStore();

  const handleSelect = (dog: Dog) => {
    selectDog(dog.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Close dog selector">
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.title}>Select Dog</Text>

          <FlatList
            data={dogs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedDogId;
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.dogRow,
                    isSelected && styles.selectedRow,
                    pressed && styles.pressedRow,
                  ]}
                  onPress={() => handleSelect(item)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${item.name}, ${item.breed}`}
                >
                  <View style={styles.dogInfo}>
                    <Text
                      style={[
                        styles.dogName,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.dogDetails}>
                      {item.breed} · {item.age_years}y · {item.weight_lbs} lbs
                    </Text>
                  </View>
                  {isSelected && (
                    <Text style={styles.checkmark} accessibilityElementsHidden>✓</Text>
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    maxHeight: '60%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  dogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minHeight: MIN_TOUCH_TARGET,
    marginBottom: SPACING.xs,
  },
  selectedRow: {
    backgroundColor: '#E3F2FD',
  },
  pressedRow: {
    backgroundColor: COLORS.divider,
  },
  dogInfo: {
    flex: 1,
  },
  dogName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  selectedText: {
    color: COLORS.primary,
  },
  dogDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkmark: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
});
