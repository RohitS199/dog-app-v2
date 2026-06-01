import React from 'react';
import { render, act } from '@testing-library/react-native';
import { FloatingTabBar } from '../ui/FloatingTabBar';
import { useProfileStore } from '../../stores/profileStore';
import { useAuthStore } from '../../stores/authStore';
import { useDogStore } from '../../stores/dogStore';
import { useArticleTransitionStore } from '../../stores/articleTransitionStore';

const baseLoaded = {
  first_name: null,
  last_name: null,
  email: null,
  phone: null,
  birthday: null,
  location: null,
  avatar_url: null as string | null,
};

function makeTabBarProps() {
  return {
    state: {
      index: 0,
      routes: [
        { key: 'index', name: 'index' },
        { key: 'health', name: 'health' },
        { key: 'learn', name: 'learn' },
        { key: 'profile', name: 'profile' },
      ],
    },
    descriptors: {},
    navigation: {
      emit: jest.fn(() => ({ defaultPrevented: false })),
      navigate: jest.fn(),
    },
  } as any;
}

describe('FloatingTabBar avatar source', () => {
  beforeEach(() => {
    useDogStore.setState({ dogs: [], selectedDogId: null });
    useArticleTransitionStore.setState({ isExpanded: false });
    useProfileStore.setState({ loaded: { ...baseLoaded } });
    useAuthStore.setState({ user: null });
  });

  it('renders the profile tab avatar from profileStore.loaded.avatar_url, not auth metadata', () => {
    // A stale value in auth metadata must NOT be the source after the single-source refactor.
    useAuthStore.setState({
      user: { user_metadata: { avatar_url: 'https://stale.example/old.jpg' } } as any,
    });
    useProfileStore.setState({
      loaded: { ...baseLoaded, avatar_url: 'https://cdn.example/a.jpg?t=1' },
    });

    const { getByTestId } = render(<FloatingTabBar {...makeTabBarProps()} />);

    expect(getByTestId('profile-tab-avatar').props.source).toEqual({
      uri: 'https://cdn.example/a.jpg?t=1',
    });
  });

  it('updates the profile tab avatar when profileStore.loaded.avatar_url changes', () => {
    useProfileStore.setState({ loaded: { ...baseLoaded, avatar_url: null } });

    const { queryByTestId, getByTestId } = render(<FloatingTabBar {...makeTabBarProps()} />);

    // No avatar yet — the profile tab falls back to its glyph, no <Image>.
    expect(queryByTestId('profile-tab-avatar')).toBeNull();

    act(() => {
      useProfileStore.setState({
        loaded: { ...baseLoaded, avatar_url: 'https://cdn.example/new.jpg' },
      });
    });

    expect(getByTestId('profile-tab-avatar').props.source).toEqual({
      uri: 'https://cdn.example/new.jpg',
    });
  });
});
