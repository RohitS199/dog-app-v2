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
} as const;
