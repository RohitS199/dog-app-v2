// Copy strings for Profile redesign. All user-facing text on Profile
// screens references this file (i18n preparation per spec section 6.3).
// Extended incrementally across PRs 1-6.

export const COPY = {
  // Log Out modal (rendered in PR 1, wired to authStore.signOut in PR 6)
  PROFILE_LOGOUT_HEADING: 'Heading out?',
  PROFILE_LOGOUT_BODY_FALLBACK: "We'll keep your dog's logs safe. You can come back any time.",
  PROFILE_LOGOUT_BODY_TEMPLATE: (dogName: string) =>
    `We'll keep ${dogName}'s logs safe. You can come back any time.`,
  PROFILE_LOGOUT_CONFIRM: 'Yes, log me out',
  PROFILE_LOGOUT_CANCEL: 'Stay',

  // Profile root (PR 2 fills in real content)
  PROFILE_ROOT_PLACEHOLDER: 'Profile',
  PROFILE_DEFAULT_DISPLAY_NAME: 'PupLog User',
  PROFILE_NAV_MY_INFO: 'My Information',
  PROFILE_NAV_MY_SUBSCRIPTION: 'My Subscription',
  PROFILE_NAV_SETTINGS: 'Settings',
  PROFILE_LOGOUT_BUTTON: 'Log Out',
  PROFILE_DELETE_ACCOUNT_LABEL: 'Delete Account',

  // My Information screen
  MY_INFO_TITLE: 'My Information',
  MY_INFO_NAME_LABEL: 'NAME',
  MY_INFO_EMAIL_LABEL: 'EMAIL',
  MY_INFO_PHONE_LABEL: 'PHONE',
  MY_INFO_BIRTHDAY_LABEL: 'BIRTHDAY',
  MY_INFO_LOCATION_LABEL: 'LOCATION',
  MY_INFO_NAME_PLACEHOLDER: 'Your full name',
  MY_INFO_PHONE_PLACEHOLDER: 'Add a phone number',
  MY_INFO_BIRTHDAY_PLACEHOLDER: 'Pick a date',
  MY_INFO_LOCATION_PLACEHOLDER: 'City, State',
  MY_INFO_SAVE_BUTTON: 'Save Changes',
  MY_INFO_SAVE_SUCCESS_TITLE: 'Saved',
  MY_INFO_SAVE_SUCCESS_BODY: 'Your information has been updated.',
  MY_INFO_SAVE_ERROR_TITLE: "Couldn't save",
  MY_INFO_SAVE_ERROR_BODY: 'Please try again.',
  MY_INFO_AVATAR_COMING_SOON_TITLE: 'Coming soon',
  MY_INFO_AVATAR_COMING_SOON_BODY: 'Avatar uploads will arrive in a future update.',

  // My Subscription screen (PR 3)
  MY_SUBSCRIPTION_TITLE: 'My Subscription',
  MY_SUBSCRIPTION_PLACEHOLDER: 'My Subscription',
  MY_SUBSCRIPTION_PLAN_INCLUDED_LABEL: "what's included",
  MY_SUBSCRIPTION_MANAGE_BILLING: 'Manage Billing',
  MY_SUBSCRIPTION_CANCEL: 'Cancel Subscription',
  MY_SUBSCRIPTION_BADGE_ACTIVE: 'active',
  MY_SUBSCRIPTION_BADGE_INACTIVE: 'inactive',
  MY_SUBSCRIPTION_RENEWS_PREFIX: 'Renews ',
  MY_SUBSCRIPTION_EXPIRED_PREFIX: 'Expired ',
  MY_SUBSCRIPTION_CANCEL_COMING_SOON_TITLE: 'Coming soon',
  MY_SUBSCRIPTION_CANCEL_COMING_SOON_BODY: 'Subscription cancellation will arrive in a future update. For now, you can manage your plan in your phone\'s subscription settings.',
  MY_SUBSCRIPTION_ERROR_TITLE: "Couldn't load subscription",
  MY_SUBSCRIPTION_ERROR_RETRY: 'Try Again',

  // Settings hub (PR 4 fills in)
  SETTINGS_TITLE: 'Settings',
  SETTINGS_PLACEHOLDER: 'Settings',

  // Settings hub nav labels
  SETTINGS_NAV_NOTIFICATIONS: 'Notifications',
  SETTINGS_NAV_SECURITY: 'Security',
  SETTINGS_NAV_HELP_CENTER: 'Help Center',
  SETTINGS_NAV_ABOUT: 'About PupLog',
  SETTINGS_NAV_PRIVACY: 'Privacy and Terms',

  // Settings sub-screen placeholder headings (filled in by follow-up subagent)
  SETTINGS_NOTIFICATIONS_PLACEHOLDER: 'Notifications',
  SETTINGS_SECURITY_PLACEHOLDER: 'Security',
  SETTINGS_HELP_CENTER_PLACEHOLDER: 'Help Center',
  SETTINGS_ABOUT_PLACEHOLDER: 'About PupLog',
  SETTINGS_PRIVACY_PLACEHOLDER: 'Privacy and Terms',
} as const;
