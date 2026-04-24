import React from 'react';
import { render } from '@testing-library/react-native';
import { BackChevron } from '../onboarding/BackChevron';
import { OB_COLORS } from '../../constants/onboardingTheme';

describe('BackChevron', () => {
  it('renders without crashing at default dimensions', () => {
    const { UNSAFE_getByType } = render(<BackChevron />);
    const svg = UNSAFE_getByType(require('react-native-svg').default);
    expect(svg.props.width).toBe(14);
    expect(svg.props.height).toBe(24);
  });

  it('uses the CTA orange as the default stroke color', () => {
    const { UNSAFE_getAllByType } = render(<BackChevron />);
    const paths = UNSAFE_getAllByType(require('react-native-svg').Path);
    expect(paths[0].props.stroke).toBe(OB_COLORS.cta);
  });

  it('accepts custom width, height, and color', () => {
    const { UNSAFE_getByType, UNSAFE_getAllByType } = render(
      <BackChevron width={20} height={30} color="#000000" />,
    );
    const svg = UNSAFE_getByType(require('react-native-svg').default);
    expect(svg.props.width).toBe(20);
    expect(svg.props.height).toBe(30);
    const paths = UNSAFE_getAllByType(require('react-native-svg').Path);
    expect(paths[0].props.stroke).toBe('#000000');
  });
});
