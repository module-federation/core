import { getLocale } from './i18n.ts';

// Localize built-in sample metadata at the presentation boundary. Unknown user
// copy, protocol identifiers, schemas, and published snapshots stay untouched.
const englishCopy: Record<string, string> = {
  发现好物: 'Discover good things',
  为认真生活挑选的日常好物: 'Everyday essentials, thoughtfully chosen',
  我的偏好: 'My preferences',
  为你推荐: 'For you',
  一些可能适合你的新发现: 'Fresh finds we think you’ll love',
  商品详情: 'Product details',
  个性化推荐: 'Personalized recommendations',
  读取偏好并生成当前版本的推荐列表:
    'Use saved preferences to generate recommendations with the current app version',
  '查看推荐商品的参数、价格与库存':
    'Explore product specifications, prices, and availability',
  查看指定商品的完整信息: 'Read the full details of a selected product',
  '浏览、搜索与比较商品': 'Browse, search, and compare products',
  设置预算与喜欢的品类: 'Set your budget and favorite categories',
  '进入独立发布的推荐应用，发现个性化建议':
    'Discover personalized picks in an independently deployed app',
  搜索商品: 'Search products',
  '搜索商品名称、品牌或品类，返回可查看的商品列表。':
    'Search by product name, brand, or category and return matching products.',
  搜索关键词: 'Search keywords',
  读取偏好: 'Read preferences',
  '读取用户已保存的预算、品类与购物偏好。':
    'Read the user’s saved budget, categories, and shopping preferences.',
  更新偏好: 'Update preferences',
  '更新明确由用户要求修改的预算、品类或购物偏好。':
    'Update the budget, categories, or preferences explicitly requested by the user.',
  为我推荐: 'Get recommendations',
  '结合已保存的偏好，用当前推荐应用版本生成商品推荐。':
    'Generate product recommendations with saved preferences and the current app version.',
  打开推荐商品: 'Open recommended product',
  '打开指定推荐商品的详情；省略商品 ID 时打开当前筛选后的第一个商品。':
    'Open a recommended product’s details. Without a product ID, open the first product in the current filtered list.',
  查看商品详情: 'Read product details',
  '读取指定商品的完整规格、价格和库存信息。':
    'Read a product’s full specifications, price, and availability.',
  '商品 ID，例如 p001': 'Product ID, for example p001',
  工作台: 'Workspace',
  商品列表: 'Product catalog',
  个人配置: 'Preferences',
  最新推荐: 'Recommendations',
  '平台已发布新的消费数据，请刷新后继续，或保留当前页面。':
    'New consumer data has been published. Refresh to continue or keep the current page.',
  '此平台没有对应的 Consumer；不能回退到其他来源。':
    'No matching consumer exists on this platform. Discovery cannot fall back to another source.',
};

export function displayCopy(text: string): string {
  return getLocale() === 'en' ? (englishCopy[text] ?? text) : text;
}
