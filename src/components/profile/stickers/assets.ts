import { ImageSourcePropType } from 'react-native';
import { StickerId } from '../../../constants/achievements';

// Static map — Metro requires literal require() paths (see
// feedback_rn_metro_static_require.md). null defaults until Gemini PNGs ship.
// When art arrives, drop in like:
//   welcome: require('../../../../assets/stickers/welcome.png'),

export const STICKER_ASSETS: Record<StickerId, ImageSourcePropType | null> = {
  welcome: require('../../../../assets/stickers/welcome.png'),
  seasonal_fall: null,
  seasonal_winter: null,
  seasonal_spring: require('../../../../assets/stickers/seasonal_spring.png'),
  seasonal_summer: null,
  pattern_spotter: require('../../../../assets/stickers/pattern_spotter.png'),
  tender_caretaker: require('../../../../assets/stickers/tender_caretaker.png'),
  first_peony: require('../../../../assets/stickers/first_peony.png'),
  bouquet_of_joy: require('../../../../assets/stickers/bouquet_of_joy.png'),
  multi_pup_parent: require('../../../../assets/stickers/multi_pup_parent.png'),
  full_spectrum: require('../../../../assets/stickers/full_spectrum.png'),
  bloom_master: require('../../../../assets/stickers/bloom_master.png'),
};
