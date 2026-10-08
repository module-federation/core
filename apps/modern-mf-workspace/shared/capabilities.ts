import type { ToolDeclaration } from './contracts.ts';

export const TOOL_DECLARATIONS: Record<string, ToolDeclaration> = {
  search_products: {
    name: 'search_products',
    title: '搜索商品',
    description: '搜索商品名称、品牌或品类，返回可查看的商品列表。',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '搜索关键词' },
        category: {
          type: 'string',
          enum: ['audio', 'workspace', 'travel', 'lifestyle'],
        },
        maxPrice: { type: 'number', minimum: 0 },
        sort: {
          type: 'string',
          enum: ['recommended', 'price_asc', 'price_desc', 'rating'],
        },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  get_preferences: {
    name: 'get_preferences',
    title: '读取偏好',
    description: '读取用户已保存的预算、品类与购物偏好。',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  update_preferences: {
    name: 'update_preferences',
    title: '更新偏好',
    description: '更新明确由用户要求修改的预算、品类或购物偏好。',
    inputSchema: {
      type: 'object',
      properties: {
        budget: { type: 'number', minimum: 0, maximum: 1000000 },
        categories: { type: 'array', items: { type: 'string' } },
        priorities: { type: 'array', items: { type: 'string' } },
        notes: { type: 'string' },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, consequentialHint: true },
  },
  get_recommendations: {
    name: 'get_recommendations',
    title: '为我推荐',
    description: '结合已保存的偏好，用当前推荐应用版本生成商品推荐。',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        category: {
          type: 'string',
          enum: ['audio', 'workspace', 'travel', 'lifestyle'],
        },
        maxPrice: { type: 'number', minimum: 0 },
        sort: {
          type: 'string',
          enum: ['recommended', 'price_asc', 'price_desc', 'rating'],
        },
        limit: { type: 'integer', minimum: 1, maximum: 12 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  open_recommendation: {
    name: 'open_recommendation',
    title: '打开推荐商品',
    description:
      '打开指定推荐商品的详情；省略商品 ID 时打开当前筛选后的第一个商品。',
    inputSchema: {
      type: 'object',
      properties: { productId: { type: 'string' } },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  get_product_details: {
    name: 'get_product_details',
    title: '查看商品详情',
    description: '读取指定商品的完整规格、价格和库存信息。',
    inputSchema: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: '商品 ID，例如 p001' },
      },
      required: ['productId'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
};
