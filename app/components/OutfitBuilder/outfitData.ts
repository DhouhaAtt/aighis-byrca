import { allProducts } from "../NewArrivals/products";

export type OutfitSlot = "top" | "bottom" | "bag" | "shoes" | "accessory";

/* ===================== QUIZ QUESTIONS ===================== */

export interface QuizOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface Question {
  id: string;
  question: string;
  multiple?: boolean;
  options: QuizOption[];
}

export const questions: Question[] = [
  {
    id: "event",
    question: "What is the occasion?",
    options: [
      { value: "casual", label: "Casual", emoji: "☕" },
      { value: "work", label: "Work & Office", emoji: "💼" },
      { value: "evening", label: "Evening Gala", emoji: "✨" },
      { value: "beach", label: "Beach", emoji: "🌊" },
      { value: "sport", label: "Sport", emoji: "🏃" },
    ],
  },
  {
    id: "mood",
    question: "What is your mood today?",
    options: [
      { value: "elegant", label: "Elegant", emoji: "🦢" },
      { value: "bold", label: "Bold", emoji: "🔥" },
      { value: "relaxed", label: "Relaxed", emoji: "😌" },
      { value: "romantic", label: "Romantic", emoji: "🌹" },
      { value: "minimalist", label: "Minimalist", emoji: "◻️" },
    ],
  },
  {
    id: "fabric",
    question: "Which fabric do you prefer?",
    options: [
      { value: "cotton", label: "Cotton", emoji: "🌿" },
      { value: "silk", label: "Silk", emoji: "✨" },
      { value: "linen", label: "Linen", emoji: "🫱" },
      { value: "wool", label: "Wool", emoji: "🧶" },
      { value: "leather", label: "Leather", emoji: "👜" },
      { value: "denim", label: "Denim", emoji: "👖" },
    ],
  },
  {
    id: "colors",
    question: "Pick your favorite colors",
    multiple: true,
    options: [
      { value: "black", label: "Black" },
      { value: "white", label: "White" },
      { value: "beige", label: "Beige" },
      { value: "blue", label: "Blue" },
      { value: "red", label: "Red" },
      { value: "green", label: "Green" },
      { value: "pink", label: "Pink" },
      { value: "brown", label: "Brown" },
    ],
  },
  {
    id: "size",
    question: "What is your size?",
    options: [
      { value: "xs", label: "XS" },
      { value: "s", label: "S" },
      { value: "m", label: "M" },
      { value: "l", label: "L" },
      { value: "xl", label: "XL" },
    ],
  },
];

/* ===================== OUTFIT MATCHING ===================== */

export interface QuizSelections {
  event: string | null;
  mood: string | null;
  fabric: string | null;
  colors: string[];
  size: string | null;
}

interface CuratedOutfit {
  id: string;
  tags: string[];
  slots: Partial<Record<OutfitSlot, number>>;
}

const curatedOutfits: CuratedOutfit[] = [
  {
    id: "casual-elegant",
    tags: ["casual", "elegant", "cotton", "linen", "beige", "white", "brown"],
    slots: { top: 15, bottom: 20, bag: 14, accessory: 8 },
  },
  {
    id: "work-polished",
    tags: ["work", "elegant", "wool", "cotton", "black", "white", "blue"],
    slots: { top: 6, bottom: 9, bag: 18, accessory: 19 },
  },
  {
    id: "evening-gala",
    tags: ["evening", "elegant", "silk", "black", "red", "pink"],
    slots: { top: 1, bag: 2, shoes: 7, accessory: 19 },
  },
  {
    id: "beach-ready",
    tags: ["beach", "relaxed", "cotton", "linen", "white", "blue", "green"],
    slots: { top: 3, bottom: 20, bag: 14, shoes: 7 },
  },
  {
    id: "sport-active",
    tags: ["sport", "bold", "cotton", "denim", "black", "blue", "green"],
    slots: { top: 16, bottom: 17, shoes: 7, accessory: 8 },
  },
  {
    id: "romantic-date",
    tags: ["evening", "romantic", "silk", "pink", "red", "white"],
    slots: { top: 13, bag: 2, accessory: 19 },
  },
  {
    id: "minimalist-chic",
    tags: ["work", "minimalist", "wool", "cotton", "black", "white", "beige"],
    slots: { top: 10, bottom: 9, bag: 14, accessory: 8 },
  },
  {
    id: "bold-street",
    tags: ["casual", "bold", "denim", "leather", "black", "brown", "red"],
    slots: { top: 16, bag: 18, shoes: 7, accessory: 8 },
  },
  {
    id: "relaxed-weekend",
    tags: ["casual", "relaxed", "cotton", "linen", "beige", "white", "blue"],
    slots: { top: 5, bottom: 20, bag: 14, accessory: 8 },
  },
  {
    id: "luxury-work",
    tags: ["work", "elegant", "silk", "wool", "black", "white", "beige"],
    slots: { top: 6, bottom: 9, bag: 18, shoes: 7, accessory: 19 },
  },
];

export interface MatchedOutfit {
  slot: OutfitSlot;
  product: (typeof allProducts)[number];
}

export function findBestOutfit(selections: QuizSelections): MatchedOutfit[] {
  const selectedTags: string[] = [
    selections.event,
    selections.mood,
    selections.fabric,
    ...selections.colors,
  ].filter(Boolean) as string[];

  let best: CuratedOutfit | null = null;
  let bestScore = -1;

  for (const outfit of curatedOutfits) {
    let score = 0;
    for (const tag of selectedTags) {
      if (outfit.tags.includes(tag)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = outfit;
    }
  }

  if (!best) return [];

  const result: MatchedOutfit[] = [];
  const slots: OutfitSlot[] = ["top", "bottom", "bag", "shoes", "accessory"];

  for (const slot of slots) {
    const productId = best.slots[slot];
    if (!productId) continue;
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      result.push({ slot, product });
    }
  }

  return result;
}

export function getSlotLabel(slot: OutfitSlot): string {
  const labels: Record<OutfitSlot, string> = {
    top: "Top",
    bottom: "Bottom",
    bag: "Bag",
    shoes: "Shoes",
    accessory: "Accessory",
  };
  return labels[slot];
}
