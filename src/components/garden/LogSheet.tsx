import { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  GARDEN_MOODS,
  GARDEN_MOOD_COLORS,
  GARDEN_MOOD_LABELS,
  GardenMood,
  GARDEN_HEALTH_CHIPS,
  GARDEN_HEALTH_CHIP_ALL_NORMAL,
} from '../../constants/gardenMoods';
import { computeFlowerTier } from '../../lib/flowerTier';
import { useGardenStore } from '../../stores/gardenStore';
import { TierMeter } from './TierMeter';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES, OB_RADII } from '../../constants/onboardingTheme';

const NOTE_MAX = 500;

interface Props {
  dogId: string;
  dogName: string;
  date: string;
  onPlanted: (mood: GardenMood, tier: 1 | 2 | 3) => void;
  onClose: () => void;
}

export function LogSheet({ dogId, dogName, date, onPlanted }: Props) {
  const router = useRouter();
  const plantFlower = useGardenStore((s) => s.plantFlower);
  const [mood, setMood] = useState<GardenMood | null>(null);
  const [chips, setChips] = useState<string[]>([]);
  const [note, setNote] = useState('');
  // Picked media boosts the flower to a full bloom (computeFlowerTier). NOTE: persistence is a
  // deferred follow-up — garden_logs has no media columns + no storage bucket yet, so the URI is
  // local-only and is NOT uploaded on plant. The picker + preview + bloom work today.
  const [media, setMedia] = useState<{ uri: string; kind: 'photo' | 'video' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tier = useMemo(
    () =>
      computeFlowerTier({
        mood,
        hasHealthChip: chips.length > 0,
        hasPhoto: media?.kind === 'photo',
        hasVideo: media?.kind === 'video',
        hasNote: note.trim().length > 0,
      }),
    [mood, chips, note, media],
  );

  const pickMedia = async () => {
    setErrorMsg(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setErrorMsg('Photo access is off. Enable it in Settings to add a photo or video.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setMedia({ uri: asset.uri, kind: asset.type === 'video' ? 'video' : 'photo' });
  };

  const toggleChip = (c: string) => {
    if (c === GARDEN_HEALTH_CHIP_ALL_NORMAL) {
      setChips((p) => (p.includes(c) ? [] : [c])); // exclusive
      return;
    }
    setChips((p) =>
      p.includes(c) ? p.filter((x) => x !== c) : [...p.filter((x) => x !== GARDEN_HEALTH_CHIP_ALL_NORMAL), c],
    );
  };

  const plant = async () => {
    if (!mood) return;
    setErrorMsg(null);
    setSaving(true);
    const ok = await plantFlower(dogId, {
      log_date: date,
      garden_mood: mood,
      health_chips: chips,
      note: note.trim() || null,
    });
    setSaving(false);
    if (ok) {
      onPlanted(mood, (tier === 0 ? 1 : tier) as 1 | 2 | 3);
    } else {
      // Don't strand the user on a silent failure — surface the store error.
      setErrorMsg(useGardenStore.getState().error ?? 'Could not plant the flower. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.sheet} keyboardDismissMode="on-drag">
      {/* 1 · Mood — unlocks everything */}
      <Text style={styles.section}>1 · How is {dogName} today?</Text>
      <View style={styles.chipWrap}>
        {GARDEN_MOODS.map((m) => (
          <Pressable
            key={m}
            onPress={() => setMood(m)}
            accessibilityRole="button"
            accessibilityState={{ selected: mood === m }}
            accessibilityLabel={`mood ${GARDEN_MOOD_LABELS[m]}`}
            style={[styles.moodChip, { borderColor: GARDEN_MOOD_COLORS[m] }, mood === m && { backgroundColor: GARDEN_MOOD_COLORS[m] }]}
          >
            <View style={[styles.dot, { backgroundColor: GARDEN_MOOD_COLORS[m] }]} />
            <Text style={styles.chipText}>{GARDEN_MOOD_LABELS[m]}</Text>
          </Pressable>
        ))}
      </View>

      {/* 2 · Health chips — unlock after mood */}
      {mood && (
        <>
          <Text style={styles.section}>2 · Anything to note? (optional)</Text>
          <View style={styles.chipWrap}>
            {GARDEN_HEALTH_CHIPS.map((c) => (
              <Pressable
                key={c}
                onPress={() => toggleChip(c)}
                accessibilityRole="button"
                accessibilityState={{ selected: chips.includes(c) }}
                accessibilityLabel={`health ${c}`}
                style={[styles.healthChip, chips.includes(c) && styles.healthChipOn]}
              >
                <Text style={styles.chipText}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* 3 · Specifics — THE FIX: unlocks after MOOD, not after a chip (spec §5.3) */}
      {mood && (
        <>
          <Text style={styles.section}>3 · Add detail (optional)</Text>
          <TextInput
            value={note}
            onChangeText={(t) => t.length <= NOTE_MAX && setNote(t)}
            multiline
            placeholder="A note for the day…"
            placeholderTextColor={OB_COLORS.muted}
            accessibilityLabel="Add a note"
            style={styles.note}
          />
        </>
      )}

      {/* 4 · Photo or video — strongest "evidence", makes the bloom full (computeFlowerTier). */}
      {mood && (
        <>
          <Text style={styles.section}>4 · Add a photo or video (optional)</Text>
          {media ? (
            <View style={styles.mediaPreview}>
              {media.kind === 'photo' ? (
                <Image source={{ uri: media.uri }} style={styles.mediaThumb} accessibilityLabel="Selected photo" />
              ) : (
                <View style={[styles.mediaThumb, styles.videoThumb]}>
                  <Text style={styles.videoGlyph}>▶</Text>
                </View>
              )}
              <View style={styles.mediaMeta}>
                <Text style={styles.mediaLabel}>{media.kind === 'photo' ? 'Photo added' : 'Video added'}</Text>
                <Text style={styles.mediaHint}>Makes today&apos;s flower a full bloom</Text>
              </View>
              <Pressable
                onPress={() => setMedia(null)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Remove media"
              >
                <Text style={styles.mediaRemove}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={pickMedia}
              accessibilityRole="button"
              accessibilityLabel="Add a photo or video"
              style={styles.mediaAdd}
            >
              <Text style={styles.mediaAddLabel}>＋  Add photo / video</Text>
            </Pressable>
          )}
        </>
      )}

      <TierMeter tier={tier} mood={mood} />

      {errorMsg && (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMsg}
        </Text>
      )}

      <Pressable
        onPress={plant}
        disabled={!mood || saving}
        accessibilityRole="button"
        accessibilityLabel={`Plant ${dogName}'s flower`}
        style={[styles.cta, (!mood || saving) && styles.ctaOff]}
      >
        <Text style={styles.ctaLabel}>{tier === 3 ? `Plant ${dogName}'s full bloom` : `Plant ${dogName}'s flower`}</Text>
      </Pressable>

      {/* Golden Rule: Emergency reachable mid-log */}
      <Pressable onPress={() => router.push('/emergency')} hitSlop={12} accessibilityRole="link" accessibilityLabel="Emergency help">
        <Text style={styles.emergency}>Emergency help ›</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: OB_COLORS.cream, padding: 20 },
  section: { fontFamily: OB_FONTS.h3, fontSize: OB_FONT_SIZES.h3, color: OB_COLORS.ink, marginTop: 16, marginBottom: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 2, borderRadius: OB_RADII.chip, paddingHorizontal: 10, paddingVertical: 8, minHeight: 44 },
  healthChip: { borderWidth: 2, borderColor: OB_COLORS.muted, borderRadius: OB_RADII.chip, paddingHorizontal: 12, paddingVertical: 8, minHeight: 44, justifyContent: 'center' },
  error: { color: OB_COLORS.red, fontFamily: OB_FONTS.body, fontSize: OB_FONT_SIZES.body, marginTop: 12, textAlign: 'center' },
  healthChipOn: { backgroundColor: OB_COLORS.selectedBg, borderColor: OB_COLORS.selectedBorder },
  dot: { width: 12, height: 12, borderRadius: 6 },
  chipText: { fontFamily: OB_FONTS.body, fontSize: OB_FONT_SIZES.body, color: OB_COLORS.ink },
  note: { minHeight: 80, borderWidth: 2, borderColor: OB_COLORS.muted, borderRadius: OB_RADII.card, padding: 12, fontFamily: OB_FONTS.body, fontSize: OB_FONT_SIZES.body, color: OB_COLORS.ink, textAlignVertical: 'top' },
  mediaAdd: { borderWidth: 2, borderStyle: 'dashed', borderColor: OB_COLORS.muted, borderRadius: OB_RADII.card, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 56 },
  mediaAddLabel: { fontFamily: OB_FONTS.cta, fontSize: OB_FONT_SIZES.body, color: OB_COLORS.ink },
  mediaPreview: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderColor: OB_COLORS.selectedBorder, backgroundColor: OB_COLORS.selectedBg, borderRadius: OB_RADII.card, padding: 10 },
  mediaThumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: OB_COLORS.muted, overflow: 'hidden' },
  videoThumb: { alignItems: 'center', justifyContent: 'center', backgroundColor: OB_COLORS.ink },
  videoGlyph: { color: OB_COLORS.cream, fontSize: 20 },
  mediaMeta: { flex: 1 },
  mediaLabel: { fontFamily: OB_FONTS.h3, fontSize: OB_FONT_SIZES.body, color: OB_COLORS.ink },
  mediaHint: { fontFamily: OB_FONTS.body, fontSize: OB_FONT_SIZES.label, color: OB_COLORS.ink2, marginTop: 2 },
  mediaRemove: { fontFamily: OB_FONTS.label, fontSize: OB_FONT_SIZES.body, color: OB_COLORS.red },
  cta: { backgroundColor: OB_COLORS.cta, borderRadius: OB_RADII.button, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  ctaOff: { opacity: 0.5 },
  ctaLabel: { color: OB_COLORS.ink, fontFamily: OB_FONTS.cta, fontSize: OB_FONT_SIZES.h3 }, // ink-on-coral
  emergency: { color: OB_COLORS.red, fontFamily: OB_FONTS.label, fontSize: OB_FONT_SIZES.body, textAlign: 'center', marginTop: 16, marginBottom: 24 },
});
