import type { Preferences, Product } from '../shared/contracts.ts';

export const defaultPreferences: Preferences = {
  budget: 2000,
  categories: ['audio', 'workspace'],
  priorities: ['comfort', 'quality'],
  notes: '希望找到适合日常工作和通勤的好物。',
};

export const products: Product[] = [
  {
    id: 'p001',
    name: 'Quiet Studio 降噪耳机',
    brand: 'FORM',
    category: 'audio',
    price: 1299,
    rating: 4.8,
    color: '#d9d2c6',
    emoji: '🎧',
    description:
      '把办公室的喧闹留在音乐之外。轻量头梁与自适应降噪适合一整天佩戴。',
    features: ['40 小时续航', '自适应降噪', '双设备连接'],
    inStock: true,
  },
  {
    id: 'p002',
    name: 'Arc 人体工学台灯',
    brand: 'LUMEN',
    category: 'workspace',
    price: 699,
    rating: 4.7,
    color: '#e7ba81',
    emoji: '💡',
    description: '一束安静的光，照亮你的深度工作时间。触摸调光与柔和色温。',
    features: ['无频闪', '五档色温', '记忆亮度'],
    inStock: true,
  },
  {
    id: 'p003',
    name: 'Daily Carry 城市背包',
    brand: 'ROAM',
    category: 'travel',
    price: 589,
    rating: 4.6,
    color: '#a9b7a1',
    emoji: '🎒',
    description: '简洁外形里装下整天计划。独立电脑夹层与防泼水面料。',
    features: ['18L 容量', '16 英寸电脑仓', '再生尼龙'],
    inStock: true,
  },
  {
    id: 'p004',
    name: 'Flow 机械键盘',
    brand: 'KEY',
    category: 'workspace',
    price: 899,
    rating: 4.9,
    color: '#b6bdcd',
    emoji: '⌨️',
    description: '清晰而柔和的敲击反馈，把每一个想法变成流畅的文字。',
    features: ['热插拔轴体', '三模连接', '铝合金机身'],
    inStock: true,
  },
  {
    id: 'p005',
    name: 'Pocket Sound 蓝牙音箱',
    brand: 'FORM',
    category: 'audio',
    price: 399,
    rating: 4.5,
    color: '#bc9e91',
    emoji: '🔊',
    description: '从书桌到野餐的小小音乐伙伴。温润音色与耐用织物表面。',
    features: ['IP67 防水', '12 小时续航', '便携挂绳'],
    inStock: true,
  },
  {
    id: 'p006',
    name: 'Slow Brew 手冲套装',
    brand: 'SUNDAY',
    category: 'lifestyle',
    price: 329,
    rating: 4.8,
    color: '#c6ad94',
    emoji: '☕',
    description: '留十分钟给自己。从磨豆到注水，让清晨有一点仪式感。',
    features: ['陶瓷滤杯', '耐热玻璃壶', '入门冲煮指南'],
    inStock: true,
  },
  {
    id: 'p007',
    name: 'Focus 27 显示器',
    brand: 'MONO',
    category: 'workspace',
    price: 1899,
    rating: 4.7,
    color: '#a8b6c0',
    emoji: '🖥️',
    description: '细腻文字与自然色彩，为设计、文档和代码提供宽阔空间。',
    features: ['4K IPS', 'USB-C 65W', '升降旋转支架'],
    inStock: true,
  },
  {
    id: 'p008',
    name: 'Trail 保温水杯',
    brand: 'ROAM',
    category: 'travel',
    price: 199,
    rating: 4.6,
    color: '#b4b8a0',
    emoji: '🥤',
    description: '无论清晨热咖啡还是午后冰水，都保持恰好的温度。',
    features: ['500ml', '食品级不锈钢', '杯盖防漏'],
    inStock: true,
  },
  {
    id: 'p009',
    name: 'Air Buds 无线耳机',
    brand: 'FORM',
    category: 'audio',
    price: 799,
    rating: 4.7,
    color: '#d3c6b8',
    emoji: '🎵',
    description: '口袋里的专注时刻。轻盈入耳设计，通勤途中也能听清每一句话。',
    features: ['主动降噪', '无线充电', '空间音频'],
    inStock: false,
  },
  {
    id: 'p010',
    name: 'Rest 羊毛靠毯',
    brand: 'SUNDAY',
    category: 'lifestyle',
    price: 459,
    rating: 4.8,
    color: '#d0a897',
    emoji: '🧶',
    description: '给阅读角一份柔软。细腻羊毛混纺，轻盈而温暖。',
    features: ['羊毛混纺', '亲肤触感', '130 × 170cm'],
    inStock: true,
  },
  {
    id: 'p011',
    name: 'Orbit 无线充电站',
    brand: 'KEY',
    category: 'workspace',
    price: 349,
    rating: 4.4,
    color: '#aab4c1',
    emoji: '🔋',
    description: '让桌面告别缠绕的线缆，手机、耳机与手表各就各位。',
    features: ['三设备同充', '磁吸定位', '过温保护'],
    inStock: true,
  },
  {
    id: 'p012',
    name: 'Weekend 旅行收纳包',
    brand: 'ROAM',
    category: 'travel',
    price: 259,
    rating: 4.5,
    color: '#b6a690',
    emoji: '🧳',
    description: '分类装好每一份期待。轻量收纳组合让短途出行从容有序。',
    features: ['三件套', '可压缩', '可水洗'],
    inStock: true,
  },
];

export function searchProducts(query = '', category?: string): Product[] {
  const q = query.trim().toLowerCase();
  return products.filter(
    (product) =>
      (!category || product.category === category) &&
      (!q ||
        `${product.name} ${product.brand} ${product.category} ${product.description} ${product.features.join(' ')}`
          .toLowerCase()
          .includes(q)),
  );
}

export function recommendProducts(
  preferences: Preferences,
  version: 'v1' | 'v2',
): Product[] {
  return products
    .filter((product) => product.inStock && product.price <= preferences.budget)
    .sort((a, b) => {
      const score = (product: Product) =>
        product.rating +
        (version === 'v2' && preferences.categories.includes(product.category)
          ? 2
          : 0);
      return score(b) - score(a);
    })
    .slice(0, 4);
}
