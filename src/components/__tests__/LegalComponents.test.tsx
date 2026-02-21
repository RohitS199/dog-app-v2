import React from 'react';
import { render } from '@testing-library/react-native';
import { DisclaimerFooter } from '../legal/DisclaimerFooter';
import { EmergencyCallBanner } from '../legal/EmergencyCallBanner';
import { CallYourVetButton } from '../legal/CallYourVetButton';
import { SourceCitation } from '../legal/SourceCitation';
import { LEGAL, EMERGENCY } from '../../constants/config';

describe('DisclaimerFooter', () => {
  it('renders default disclaimer text', () => {
    const { getByText } = render(<DisclaimerFooter />);
    expect(getByText(LEGAL.DISCLAIMER_TEXT)).toBeTruthy();
  });

  it('renders custom disclaimer text', () => {
    const { getByText } = render(
      <DisclaimerFooter text="Custom disclaimer" />
    );
    expect(getByText('Custom disclaimer')).toBeTruthy();
  });
});

describe('EmergencyCallBanner', () => {
  it('renders find emergency vet button', () => {
    const { getByText } = render(<EmergencyCallBanner />);
    expect(getByText('Find Emergency Vet Near You')).toBeTruthy();
  });

  it('shows poison control when prop is true', () => {
    const { getByText } = render(<EmergencyCallBanner showPoisonControl />);
    expect(getByText('ASPCA Poison Control')).toBeTruthy();
    expect(getByText(EMERGENCY.ASPCA_POISON_CONTROL)).toBeTruthy();
  });

  it('hides poison control when prop is false', () => {
    const { queryByText } = render(<EmergencyCallBanner />);
    expect(queryByText('ASPCA Poison Control')).toBeNull();
  });
});

describe('CallYourVetButton', () => {
  it('renders call button with phone number', () => {
    const { getByText } = render(
      <CallYourVetButton vetPhone="555-123-4567" />
    );
    expect(getByText('Call Your Vet')).toBeTruthy();
    expect(getByText('555-123-4567')).toBeTruthy();
  });

  it('renders no-vet message when phone is null', () => {
    const { getByText } = render(<CallYourVetButton vetPhone={null} />);
    expect(getByText(/No vet phone number on file/)).toBeTruthy();
  });
});

describe('SourceCitation', () => {
  it('renders nothing when sources are empty', () => {
    const { toJSON } = render(<SourceCitation sources={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('renders source names', () => {
    const sources = [
      { name: 'Merck Veterinary Manual', tier: 1, url: 'https://example.com' },
      { name: 'Cornell Vet School', tier: 2, url: 'https://example.com' },
    ];
    const { getByText } = render(<SourceCitation sources={sources} />);
    expect(getByText('Merck Veterinary Manual')).toBeTruthy();
    expect(getByText('Cornell Vet School')).toBeTruthy();
  });

  it('renders tier labels', () => {
    const sources = [
      { name: 'Test Source', tier: 1, url: '' },
    ];
    const { getByText } = render(<SourceCitation sources={sources} />);
    expect(getByText('Veterinary Reference')).toBeTruthy();
  });
});
