import { ImageSourcePropType } from 'react-native';
import { StickerId } from '../../../constants/achievements';

// Static map — Metro requires literal require() paths (see
// feedback_rn_metro_static_require.md). null defaults until Gemini PNGs ship.
// When art arrives, drop in like:
//   welcome: require('../../../../assets/stickers/welcome.png'),

export const STICKER_ASSETS: Record<StickerId, ImageSourcePropType | null> = {
  welcome: null,
  seasonal_fall: null,
  seasonal_winter: null,
  seasonal_spring: null,
  seasonal_summer: null,
  pattern_spotter: null,
  first_peony: null,
  bouquet_of_joy: null,
  multi_pup_parent: null,
  full_spectrum: null,
  bloom_master: null,
};
