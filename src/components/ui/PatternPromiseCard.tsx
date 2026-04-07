import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface PatternPromiseCardProps {
  dogName: string;
}

const TIMELINE_NODES = [
  { day: 'Day 1', label: 'First health snapshot', completed: true },
  { day: 'Day 5', label: 'Pattern detection unlocks', completed: false },
  { day: 'Day 14', label: 'AI health insights activate', completed: false },
];

export function PatternPromiseCard({ dogName }: PatternPromiseCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {dogName}'s Health Intelligence Timeline
      </Text>

      <View style={styles.timeline}>
        {TIMELINE_NODES.map((node, index) => (
          <View key={node.day} style={styles.timelineRow}>
            {/* Vertical line */}
            {index < TIMELINE_NODES.length - 1 && (
              <View
                style={[
                  styles.verticalLine,
                  node.completed ? styles.lineCompleted : styles.lineLocked,
                ]}
              />
            )}

            {/* Node dot */}
            <View
              style={[
                styles.nodeDot,
                node.completed ? styles.dotCompleted : styles.dotLocked,
              ]}
            >
              {node.completed ? (
                <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons name="lock" size={12} color={COLORS.textDisabled} />
              )}
            </View>

            {/* Content */}
            <View style={styles.nodeContent}>
              <Text
                style={[
                  styles.nodeDay,
                  node.completed ? styles.textCompleted : styles.textLocked,
                ]}
              >
                {node.day}
              </Text>
              <Text
                style={[
                  styles.nodeLabel,
                  node.completed ? styles.labelCompleted : styles.labelLocked,
                ]}
              >
                {node.label}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Blurred AI insight teaser */}
      <View style={styles.teaserContainer}>
        <View style={styles.teaserCard}>
          <View style={styles.teaserBadge}>
            <Text style={styles.teaserBadgeText}>AI Insight</Text>
          </View>
          <Text style={styles.teaserTitle}>Pattern Analysis</Text>
          <Text style={styles.teaserMessage}>
            Daily check-ins build a picture of {dogName}'s health baseline...
          </Text>
        </View>
        <View style={styles.teaserOverlay}>
          <MaterialCommunityIcons name="lock-outline" size={24} color={COLORS.textDisabled} />
          <Text style={styles.teaserOverlayText}>
            5 daily check-ins to unlock
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  timeline: {
    paddingLeft: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  verticalLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    width: 2,
    height: 40,
  },
  lineCompleted: {
    backgroundColor: COLORS.success,
  },
  lineLocked: {
    backgroundColor: COLORS.border,
  },
  nodeDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  dotCompleted: {
    backgroundColor: COLORS.success,
  },
  dotLocked: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  nodeContent: {
    flex: 1,
    paddingTop: 2,
  },
  nodeDay: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  nodeLabel: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  textCompleted: {
    color: COLORS.success,
  },
  textLocked: {
    color: COLORS.textDisabled,
  },
  labelCompleted: {
    color: COLORS.textPrimary,
  },
  labelLocked: {
    color: COLORS.textSecondary,
  },
  teaserContainer: {
    position: 'relative',
  },
  teaserCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    opacity: 0.4,
  },
  teaserBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  teaserBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.info,
  },
  teaserTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  teaserMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  teaserOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 250, 250, 0.6)',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teaserOverlayText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
