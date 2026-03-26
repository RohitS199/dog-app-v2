import { create } from 'zustand';

interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ArticleTransitionState {
  isExpanded: boolean;
  isClosing: boolean;
  selectedSlug: string | null;
  originRect: OriginRect | null;
  accentColor: string | null;
  iconName: string | null;
  imageBg: string | null;

  startTransition: (
    slug: string,
    rect: OriginRect,
    accentColor: string,
    iconName: string,
    imageBg: string,
  ) => void;
  closeTransition: () => void;
  reset: () => void;
}

export const useArticleTransitionStore = create<ArticleTransitionState>((set, get) => ({
  isExpanded: false,
  isClosing: false,
  selectedSlug: null,
  originRect: null,
  accentColor: null,
  iconName: null,
  imageBg: null,

  startTransition: (slug, rect, accentColor, iconName, imageBg) => {
    if (get().isExpanded) return; // guard re-entry
    set({
      isExpanded: true,
      isClosing: false,
      selectedSlug: slug,
      originRect: rect,
      accentColor,
      iconName,
      imageBg,
    });
  },

  closeTransition: () => {
    if (!get().isExpanded || get().isClosing) return;
    set({ isClosing: true });
  },

  reset: () => {
    set({
      isExpanded: false,
      isClosing: false,
      selectedSlug: null,
      originRect: null,
      accentColor: null,
      iconName: null,
      imageBg: null,
    });
  },
}));
