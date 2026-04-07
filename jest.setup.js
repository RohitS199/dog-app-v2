// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-network
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(() =>
    Promise.resolve({ isConnected: true, isInternetReachable: true })
  ),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  useLocalSearchParams: () => ({}),
  Link: 'Link',
  Slot: 'Slot',
  Stack: { Screen: 'Screen' },
  Tabs: { Screen: 'Screen' },
}));

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(() => Promise.resolve({ data: null })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/avatar.jpg' } })),
        remove: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    },
    functions: {
      invoke: jest.fn(),
    },
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(() => Promise.resolve({ type: 'cancel' })),
  maybeCompleteAuthSession: jest.fn(),
}));

// Mock expo-auth-session
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'puplog://auth/callback'),
}));

// Mock expo-apple-authentication
jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn(() =>
    Promise.resolve({
      identityToken: 'mock-apple-identity-token',
      email: 'test@example.com',
      fullName: { givenName: 'Test', familyName: 'User' },
    })
  ),
  AppleAuthenticationScope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', granted: true })
  ),
}));

// Mock expo-image-manipulator
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(() =>
    Promise.resolve({ uri: 'file:///edited-image.jpg', width: 400, height: 400 })
  ),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  const mockGestureInstance = {
    onUpdate: function() { return mockGestureInstance; },
    onEnd: function() { return mockGestureInstance; },
    onStart: function() { return mockGestureInstance; },
    activeOffsetX: function() { return mockGestureInstance; },
    activeOffsetY: function() { return mockGestureInstance; },
    failOffsetX: function() { return mockGestureInstance; },
    failOffsetY: function() { return mockGestureInstance; },
    enabled: function() { return mockGestureInstance; },
  };

  return {
    GestureHandlerRootView: (props) => React.createElement(View, props),
    GestureDetector: ({ children }) => children,
    Gesture: {
      Pan: () => ({ ...mockGestureInstance }),
      Tap: () => ({ ...mockGestureInstance }),
    },
  };
});

// Mock react-native-worklets (must come before reanimated)
jest.mock('react-native-worklets', () => ({}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  const AnimatedView = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref })
  );
  const AnimatedScrollView = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref })
  );

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      ScrollView: AnimatedScrollView,
      createAnimatedComponent: (component) => component,
    },
    useSharedValue: (init) => ({ value: init }),
    useAnimatedStyle: (fn) => fn(),
    useAnimatedScrollHandler: () => undefined,
    withTiming: (toValue, _config, callback) => {
      if (callback) callback(true);
      return toValue;
    },
    withSpring: (toValue) => toValue,
    withDelay: (_delay, value) => value,
    runOnJS: (fn) => fn,
    useDerivedValue: (fn) => ({ value: fn() }),
    interpolate: (val, inputRange, outputRange) => {
      if (val <= inputRange[0]) return outputRange[0];
      if (val >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];
      for (let i = 0; i < inputRange.length - 1; i++) {
        if (val >= inputRange[i] && val <= inputRange[i + 1]) {
          const t = (val - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
          return outputRange[i] + t * (outputRange[i + 1] - outputRange[i]);
        }
      }
      return outputRange[0];
    },
    Easing: {
      linear: (v) => v,
      ease: (v) => v,
      bezier: () => (v) => v,
      inOut: () => (v) => v,
      in: () => (v) => v,
      out: () => (v) => v,
      cubic: (v) => v,
    },
    Extrapolation: { CLAMP: 'clamp' },
    useReducedMotion: () => false,
  };
});

// Mock lottie-react-native
jest.mock('lottie-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const LottieView = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref, testID: 'lottie-view' })
  );
  LottieView.displayName = 'LottieView';
  return { __esModule: true, default: LottieView };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  const createMockComponent = (name) => {
    const Component = (props) => React.createElement(View, { ...props, testID: name });
    Component.displayName = name;
    return Component;
  };

  const Svg = createMockComponent('Svg');
  Svg.default = Svg;

  return {
    __esModule: true,
    default: Svg,
    Svg,
    Circle: createMockComponent('Circle'),
    Path: createMockComponent('Path'),
    G: createMockComponent('G'),
    Rect: createMockComponent('Rect'),
    Line: createMockComponent('Line'),
    Text: createMockComponent('SvgText'),
  };
});

