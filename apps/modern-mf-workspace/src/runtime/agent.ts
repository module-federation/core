import type {
  AgentMessage,
  AgentResponse,
  Json,
  ModelTool,
} from '../../shared/contracts';
import { ToolRegistry } from './tools';

export interface EntryView {
  id: string;
  title: string;
  description: string;
  path: string;
}
export interface AgentHost {
  entries(): EntryView[];
  open(path: string, signal?: AbortSignal): Promise<void>;
  registry: ToolRegistry;
  onStep(
    label: string,
    status: 'running' | 'done' | 'error',
    detail?: unknown,
  ): void;
}
const orchestrationTools: ModelTool[] = [
  {
    type: 'function',
    function: {
      name: 'workspace_list_applications',
      description:
        '列出部署平台当前层的可访问应用入口。动态子应用的内部工具需打开后才能发现。',
      parameters: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'workspace_open_application',
      description:
        '打开已发现目录中的页面，并等待页面工具就绪。请先查询入口目录，使用目录返回的 path。此工具不返回业务查询结果，打开后继续调用该页面工具。',
      parameters: {
        type: 'object',
        properties: { path: { type: 'string' } },
        required: ['path'],
        additionalProperties: false,
      },
    },
  },
];
async function execute(
  host: AgentHost,
  name: string,
  args: Record<string, Json>,
  signal: AbortSignal,
): Promise<Json> {
  signal.throwIfAborted();
  host.onStep(name, 'running', args);
  try {
    let result: Json;
    if (name === 'workspace_list_applications')
      result = host.entries() as unknown as Json;
    else if (name === 'workspace_open_application') {
      const path = String(args.path);
      if (!host.entries().some((entry) => entry.path === path))
        throw new Error('只能打开当前发现目录中已有的入口');
      await host.open(path, signal);
      result = {
        path,
        tools: host.registry
          .list()
          .filter((h) => h.status === 'ready')
          .map((h) => ({ name: h.name, description: h.description })),
      };
    } else result = await host.registry.execute(name, args, signal);
    host.onStep(name, 'done', result);
    return result;
  } catch (error) {
    host.onStep(name, 'error', String(error));
    throw error;
  }
}
export async function runModel(
  host: AgentHost,
  messages: AgentMessage[],
  signal: AbortSignal,
): Promise<string> {
  for (let step = 0; step < 12; step++) {
    signal.throwIfAborted();
    const tools: ModelTool[] = [
      ...orchestrationTools,
      ...host.registry
        .list()
        .filter((h) => h.status === 'ready')
        .map((h) => ({
          type: 'function' as const,
          function: {
            name: h.name,
            description: h.description,
            parameters: h.inputSchema,
          },
        })),
    ];
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, tools }),
      signal,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || '模型请求失败');
    const message = (data as AgentResponse).message;
    messages.push(message);
    if (!message.tool_calls?.length)
      return message.content || '已完成页面操作。';
    // Tools run sequentially: opening a page changes the available tool set.
    for (const call of message.tool_calls) {
      signal.throwIfAborted();
      let result: Json;
      try {
        result = await execute(
          host,
          call.function.name,
          JSON.parse(call.function.arguments),
          signal,
        );
      } catch (error) {
        signal.throwIfAborted();
        result = { error: String(error) };
      }
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }
  throw new Error('已达到本轮工具调用上限，请缩小操作范围。');
}
function summarize(result: Json): string {
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    const data = result as Record<string, Json>;
    const items = data.products ?? data.items ?? data.recommendations;
    if (Array.isArray(items))
      return items.length
        ? `页面已更新，当前有 ${items.length} 件商品。\n\n${items
            .slice(0, 4)
            .map((item) => {
              const p = item as Record<string, Json>;
              return `${p.name} · ¥${p.price}${p.reason ? `\n${p.reason}` : ''}`;
            })
            .join('\n\n')}`
        : '页面已更新，当前条件下没有符合的商品。可以放宽预算或清空筛选。';
    if (data.name) {
      const reasons = Array.isArray(data.reasons)
        ? data.reasons
            .map((reason) =>
              reason && typeof reason === 'object' && !Array.isArray(reason)
                ? `${reason.title}\n${reason.detail}`
                : String(reason),
            )
            .join('\n\n')
        : data.reason;
      return `${data.name} · ¥${data.price}\n\n${data.description || ''}${reasons ? `\n\n推荐理由：\n${reasons}` : ''}`;
    }
  }
  return `操作已完成，页面与结果同步。\n\n${JSON.stringify(result, null, 2)}`;
}
/** Explicit demo decision replay. It uses the live tool registry and never replays old results. */
export async function runReplay(
  host: AgentHost,
  prompt: string,
  signal: AbortSignal,
): Promise<string> {
  const entries = (await execute(
    host,
    'workspace_list_applications',
    {},
    signal,
  )) as unknown as EntryView[];
  const open = async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) throw new Error(`目录中没有 ${id} 入口`);
    await execute(
      host,
      'workspace_open_application',
      { path: entry.path },
      signal,
    );
  };
  const call = async (localName: string, args: Record<string, Json> = {}) => {
    const matches = host.registry
      .list()
      .filter((h) => h.localName === localName && h.status === 'ready');
    if (matches.length !== 1)
      throw new Error(
        matches.length
          ? '当前有多个同类页面，请在实例诊断面板指定工具。'
          : `当前页面未提供 ${localName}，请检查部署配置或等待加载。`,
      );
    return execute(host, matches[0].name, args, signal);
  };
  const price = prompt.match(/(\d+)\s*元/);
  const filters: Record<string, Json> = {};
  if (price) filters.maxPrice = Number(price[1]);
  if (/数码|耳机|影音/.test(prompt)) filters.category = 'audio';
  if (/桌面|办公/.test(prompt)) filters.category = 'workspace';
  if (/价格.*排|便宜|从低到高/.test(prompt)) filters.sort = 'price_asc';
  if (/偏好|兴趣|个人配置/.test(prompt)) {
    await open('preferences');
    if (/改|设|保存/.test(prompt)) {
      const update: Record<string, Json> = {};
      if (price) update.budget = Number(price[1]);
      if (filters.category) update.categories = [filters.category];
      if (!Object.keys(update).length)
        return '回放支持“把预算设为 500 元”或“把兴趣改成数码”等预设修改。自由对话请切换真实模型。';
      const result = await call('update_preferences', update);
      if (!/推荐/.test(prompt))
        return `偏好已保存。\n\n${JSON.stringify(result, null, 2)}`;
    } else if (!/推荐/.test(prompt))
      return `当前偏好：\n\n${JSON.stringify(await call('get_preferences'), null, 2)}`;
  }
  if (/推荐|展开|详情|只看/.test(prompt)) {
    await open('recommendations');
    const result = await call('get_recommendations', filters);
    if (/展开|详情|为什么/.test(prompt)) {
      const opened = await call('open_recommendation');
      await host.registry.waitFor('details', signal);
      const resultRecord = opened as Record<string, Json>;
      const id = resultRecord.productId ?? resultRecord.id;
      if (typeof id !== 'string')
        throw new Error('页面没有返回已打开商品的 ID');
      return summarize(await call('get_product_details', { productId: id }));
    }
    return summarize(result);
  }
  if (/商品|列表|价格|排序/.test(prompt)) {
    await open('catalog');
    return summarize(await call('search_products', filters));
  }
  return '当前是演示回放模式，支持推荐、筛选、详情、商品排序和偏好修改。请使用下面的示例提问，或配置模型后切换真实模型。';
}
