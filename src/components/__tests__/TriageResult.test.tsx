import React from 'react';
import { render } from '@testing-library/react-native';
import { TriageResult } from '../ui/TriageResult';
import { OffTopicResult } from '../ui/OffTopicResult';
import type { TriageResponse, EmergencyBypassResponse, OffTopicResponse } from '../../types/api';

const mockTriageResponse: TriageResponse = {
  type: 'triage',
  urgency: 'soon',
  headline: 'Possible ear infection',
  educational_info: 'Ear scratching combined with head shaking may indicate an ear infection.',
  what_to_tell_vet: [
    'Duration of symptoms',
    'Which ear is affected',
    'Any discharge observed',
  ],
  sources: [
    { name: 'Merck Veterinary Manual', tier: 1, url: 'https://example.com' },
  ],
  disclaimer: 'This is educational information only.',
};

const mockEmergencyBypass: EmergencyBypassResponse = {
  type: 'emergency_bypass',
  urgency: 'emergency',
  headline: 'Possible poisoning - seek help immediately',
  educational_info: 'Chocolate contains theobromine which is toxic to dogs.',
  what_to_tell_vet: ['Type of chocolate', 'Amount consumed', 'Time of ingestion'],
  sources: [],
  show_poison_control: true,
  poison_control_number: '888-426-4435',
  disclaimer: 'This is educational information only.',
};

const mockOffTopic: OffTopicResponse = {
  type: 'off_topic',
  message: 'PawCheck is designed for dog health questions only. I can\'t help with cat symptoms, but your vet can!',
  reason: 'non_dog_animal',
};

describe('TriageResult', () => {
  it('renders headline', () => {
    const { getByText } = render(
      <TriageResult result={mockTriageResponse} vetPhone={null} />
    );
    expect(getByText('Possible ear infection')).toBeTruthy();
  });

  it('renders educational info', () => {
    const { getByText } = render(
      <TriageResult result={mockTriageResponse} vetPhone={null} />
    );
    expect(getByText(/Ear scratching combined/)).toBeTruthy();
  });

  it('renders what to tell vet items', () => {
    const { getByText } = render(
      <TriageResult result={mockTriageResponse} vetPhone={null} />
    );
    expect(getByText('Duration of symptoms')).toBeTruthy();
    expect(getByText('Which ear is affected')).toBeTruthy();
  });

  it('renders sources', () => {
    const { getByText } = render(
      <TriageResult result={mockTriageResponse} vetPhone={null} />
    );
    expect(getByText('Merck Veterinary Manual')).toBeTruthy();
  });

  it('renders disclaimer', () => {
    const { getByText } = render(
      <TriageResult result={mockTriageResponse} vetPhone={null} />
    );
    expect(getByText('This is educational information only.')).toBeTruthy();
  });

  it('renders emergency bypass with poison control', () => {
    const { getByText } = render(
      <TriageResult result={mockEmergencyBypass} vetPhone={null} />
    );
    expect(getByText(/Possible poisoning/)).toBeTruthy();
    expect(getByText('888-426-4435')).toBeTruthy();
  });

  it('renders vet phone when provided', () => {
    const { getByText } = render(
      <TriageResult result={mockTriageResponse} vetPhone="555-123-4567" />
    );
    expect(getByText('Call Your Vet')).toBeTruthy();
    expect(getByText('555-123-4567')).toBeTruthy();
  });

  it('shows no-vet message when no phone', () => {
    const { getByText } = render(
      <TriageResult result={mockTriageResponse} vetPhone={null} />
    );
    expect(getByText(/No vet phone number on file/)).toBeTruthy();
  });
});

describe('OffTopicResult', () => {
  it('renders off-topic message', () => {
    const onTryAgain = jest.fn();
    const { getByText } = render(
      <OffTopicResult result={mockOffTopic} onTryAgain={onTryAgain} />
    );
    expect(getByText(/PawCheck is designed for dog health/)).toBeTruthy();
  });

  it('renders Try Again button', () => {
    const onTryAgain = jest.fn();
    const { getByText } = render(
      <OffTopicResult result={mockOffTopic} onTryAgain={onTryAgain} />
    );
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('does not render urgency badge', () => {
    const onTryAgain = jest.fn();
    const { queryByText } = render(
      <OffTopicResult result={mockOffTopic} onTryAgain={onTryAgain} />
    );
    expect(queryByText('Emergency')).toBeNull();
    expect(queryByText('Urgent')).toBeNull();
    expect(queryByText('Soon')).toBeNull();
    expect(queryByText('Low Urgency')).toBeNull();
  });
});
