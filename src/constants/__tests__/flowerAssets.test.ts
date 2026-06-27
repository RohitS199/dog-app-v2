import { FLOWER_ASSETS, SCENE_ASSETS } from '../flowerAssets';
import { GARDEN_MOODS } from '../gardenMoods';

describe('flowerAssets', () => {
  it('has all 8 moods × 3 tiers = 24 flower sources', () => {
    let count = 0;
    for (const mood of GARDEN_MOODS) {
      for (const tier of [1, 2, 3] as const) {
        expect(FLOWER_ASSETS[mood][tier]).toBeDefined();
        count++;
      }
    }
    expect(count).toBe(24);
  });

  it('exposes the doghouse from the scene kit', () => {
    expect(SCENE_ASSETS.doghouse).toBeDefined();
    // TODO(scene-kit): re-enable sprout/mound assertions when those PNGs are generated
    // (owner-pending art, spec §6.6 — puplog-sprout.png / puplog-mound.png not yet in assets/garden/).
    // expect(SCENE_ASSETS.sprout).toBeDefined();
    // expect(SCENE_ASSETS.mound).toBeDefined();
  });
});
