// Help FAQ catalog for the Help Center screen (spec §9.7).
// Each entry has a destination that is one of:
//   - { type: 'route'; href: string }   — navigate to a screen
//   - { type: 'sheet'; body: string }   — show an inline bottom sheet
//   - { type: 'mailto'; subject: string } — open the email client

export type HelpFaq = {
  id: string;
  title: string;
  destination:
    | { type: 'route'; href: string }
    | { type: 'sheet'; body: string }
    | { type: 'mailto'; subject: string };
};

export const HELP_FAQS: HelpFaq[] = [
  {
    id: 'daily-logs',
    title: 'How do daily logs work?',
    destination: {
      type: 'sheet',
      body: 'Daily logs ask 9 quick questions about your dog\'s appetite, energy, stool, mobility, and mood. Submit one log per dog per day to build a health timeline. PupLog spots patterns and surfaces concerns as alerts.',
    },
  },
  {
    id: 'share-vet',
    title: 'Sharing with my vet',
    destination: {
      type: 'sheet',
      body: 'Vet-ready PDF export is a Pro plan perk. From the My Dogs tab, tap a dog and choose "Export for vet" to generate a 7- or 30-day health summary PDF you can email or AirDrop to your vet.',
    },
  },
  {
    id: 'add-dog',
    title: 'Adding a second dog',
    destination: { type: 'route', href: '/add-dog' },
  },
  {
    id: 'cancel-sub',
    title: 'Cancel subscription',
    destination: { type: 'route', href: '/profile/my-subscription' },
  },
];

export const HELP_SUPPORT_EMAIL = 'support@puplog.app';
