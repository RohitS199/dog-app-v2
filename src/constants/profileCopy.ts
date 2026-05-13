// Copy strings for Profile redesign. All user-facing text on Profile
// screens references this file (i18n preparation per spec section 6.3).
// Subsequent PRs (2-6) extend this with their screen-specific copy.

export const COPY = {
  // Log Out modal (rendered in PR 1, wired to authStore in PR 6)
  PROFILE_LOGOUT_HEADING: 'Heading out?',
  PROFILE_LOGOUT_BODY_FALLBACK: "We'll keep your dog's logs safe. You can come back any time.",
  PROFILE_LOGOUT_BODY_TEMPLATE: (dogName: string) =>
    `We'll keep ${dogName}'s logs safe. You can come back any time.`,
  PROFILE_LOGOUT_CONFIRM: 'Yes, log me out',
  PROFILE_LOGOUT_CANCEL: 'Stay',

  // Profile root (placeholder until PR 2 fills in)
  PROFILE_ROOT_PLACEHOLDER: 'Profile',

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
} as const;
