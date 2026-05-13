import React from 'react';
import { render } from '@testing-library/react-native';
import { StickerIcon } from '../StickerIcon';

describe('StickerIcon', () => {
  it('renders the provided character', () => {
    const { getByText } = render(<StickerIcon char="P" />);
    expect(getByText('P')).toBeTruthy();
  });

  it('uses default backgroundColor when bg prop omitted', () => {
    const { getByText } = render(<StickerIcon char="§" />);
    expect(getByText('§')).toBeTruthy();
  });
});
