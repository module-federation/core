import type { Preferences, Product } from './contracts.ts';
import { getLocale, type Locale } from './i18n.ts';

const englishProducts: Record<
  string,
  Pick<Product, 'name' | 'description' | 'features'>
> = {
  p001: {
    name: 'Quiet Studio Headphones',
    description:
      'Leave office noise outside your music. A lightweight headband and adaptive noise cancellation keep you comfortable all day.',
    features: [
      '40-hour battery',
      'Adaptive noise cancellation',
      'Dual-device connection',
    ],
  },
  p002: {
    name: 'Arc Desk Lamp',
    description:
      'A quiet pool of light for deep work, with touch dimming and gentle color temperatures.',
    features: [
      'Flicker-free light',
      'Five color temperatures',
      'Brightness memory',
    ],
  },
  p003: {
    name: 'Daily Carry Backpack',
    description:
      'Room for your whole day in a simple silhouette, with a dedicated laptop sleeve and water-resistant fabric.',
    features: ['18L capacity', '16-inch laptop sleeve', 'Recycled nylon'],
  },
  p004: {
    name: 'Flow Mechanical Keyboard',
    description:
      'Crisp, gentle keystrokes turn every idea into a smooth flow of words.',
    features: [
      'Hot-swappable switches',
      'Three connection modes',
      'Aluminum body',
    ],
  },
  p005: {
    name: 'Pocket Sound Speaker',
    description:
      'A small music companion for your desk or a picnic, with warm sound and a durable fabric finish.',
    features: ['IP67 waterproof', '12-hour battery', 'Carry strap'],
  },
  p006: {
    name: 'Slow Brew Pour-over Set',
    description:
      'Take ten minutes for yourself. From grinding to pouring, make a little room for your morning ritual.',
    features: [
      'Ceramic dripper',
      'Heat-resistant glass carafe',
      'Beginner brewing guide',
    ],
  },
  p007: {
    name: 'Focus 27 Monitor',
    description:
      'Sharp text and natural colors give your designs, documents and code room to breathe.',
    features: ['4K IPS', 'USB-C 65W', 'Height-adjustable swivel stand'],
  },
  p008: {
    name: 'Trail Insulated Tumbler',
    description:
      'Keep morning coffee warm and afternoon water cool, wherever the day takes you.',
    features: ['500ml', 'Food-grade stainless steel', 'Leakproof lid'],
  },
  p009: {
    name: 'Air Buds Wireless Earbuds',
    description:
      'A moment of focus in your pocket. A lightweight fit keeps every word clear on your commute.',
    features: [
      'Active noise cancellation',
      'Wireless charging',
      'Spatial audio',
    ],
  },
  p010: {
    name: 'Rest Wool Throw',
    description:
      'Something soft for your reading corner. A fine wool blend feels light and warm.',
    features: ['Wool blend', 'Soft to the touch', '130 × 170cm'],
  },
  p011: {
    name: 'Orbit Wireless Charging Station',
    description:
      'Clear the cables from your desk and give your phone, earbuds and watch a place of their own.',
    features: [
      'Charge three devices',
      'Magnetic alignment',
      'Overheat protection',
    ],
  },
  p012: {
    name: 'Weekend Packing Cubes',
    description:
      'A lightweight packing set that keeps every part of your next short trip neatly organized.',
    features: ['Set of three', 'Compressible', 'Washable'],
  },
};

/** Localize sample copy without changing product identity, price, or inventory. */
export function localizeProduct(
  product: Product,
  locale: Locale = getLocale(),
): Product {
  const copy = locale === 'en' ? englishProducts[product.id] : undefined;
  return copy ? { ...product, ...copy, features: [...copy.features] } : product;
}

const pageCopy: Record<string, string> = {
  为认真生活挑选的日常好物: 'Thoughtful finds for everyday living',
  一些可能适合你的新发现: 'A few new finds, just for you',
};

/** Custom deployment copy remains exactly as supplied by the publisher. */
export function localizePageCopy(value: string, locale: Locale = getLocale()) {
  return locale === 'en' ? (pageCopy[value] ?? value) : value;
}

export function localizePreferences(
  preferences: Preferences,
  locale: Locale = getLocale(),
): Preferences {
  if (
    locale === 'en' &&
    preferences.customized !== true &&
    preferences.notes === '希望找到适合日常工作和通勤的好物。'
  ) {
    return {
      ...preferences,
      notes: 'Looking for thoughtful finds for everyday work and commuting.',
    };
  }
  return preferences;
}
