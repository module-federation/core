import type {
  AgentMessage,
  AgentRequest,
  AgentResponse,
  ModelTool,
  ModelToolCall,
} from '../shared/contracts.ts';
import { HttpError, invalid, record, textValue } from './validation.ts';

export interface ModelEnvironment {
  MODEL_BASE_URL?: string;
  MODEL_API_KEY?: string;
  MODEL_NAME?: string;
}
export function readModelEnvironment(): ModelEnvironment {
  return {
    MODEL_BASE_URL: process.env.MODEL_BASE_URL,
    MODEL_API_KEY: process.env.MODEL_API_KEY,
    MODEL_NAME: process.env.MODEL_NAME,
  };
}
export function modelStatus(env: ModelEnvironment = readModelEnvironment()) {
  return {
    configured: Boolean(env.MODEL_API_KEY?.trim()),
    model: env.MODEL_NAME || 'gpt-4.1-mini',
  };
}

function validateToolCall(value: unknown): ModelToolCall {
  const call = record(value, 'tool_call');
  if (call.type !== 'function') invalid('仅支持 function tool calls');
  const fn = record(call.function, 'tool_call.function');
  return {
    id: textValue(call.id, 'tool_call.id', 200),
    type: 'function',
    function: {
      name: textValue(fn.name, 'function.name', 200),
      arguments: textValue(fn.arguments, 'function.arguments', 30000),
    },
  };
}
export function validateAgentRequest(value: unknown): AgentRequest {
  const obj = record(value, 'agent request');
  if (
    !Array.isArray(obj.messages) ||
    !obj.messages.length ||
    obj.messages.length > 80
  )
    invalid('messages 必须包含 1 至 80 条消息');
  if (!Array.isArray(obj.tools) || obj.tools.length > 60)
    invalid('tools 必须为最多 60 项的数组');
  const messages: AgentMessage[] = obj.messages.map((value) => {
    const message = record(value, 'message');
    if (!['user', 'assistant', 'tool'].includes(String(message.role)))
      invalid('message.role 不受支持');
    const result: AgentMessage = {
      role: message.role as AgentMessage['role'],
      content:
        message.content === null
          ? null
          : textValue(message.content, 'message.content', 40000),
    };
    if (result.role !== 'assistant' && result.content === null)
      invalid('只有 assistant content 可为 null');
    if (message.tool_call_id !== undefined)
      result.tool_call_id = textValue(
        message.tool_call_id,
        'tool_call_id',
        200,
      );
    if (result.role === 'tool' && !result.tool_call_id)
      invalid('tool message 缺少 tool_call_id');
    if (message.tool_calls !== undefined) {
      if (
        result.role !== 'assistant' ||
        !Array.isArray(message.tool_calls) ||
        message.tool_calls.length > 20
      )
        invalid('tool_calls 无效');
      result.tool_calls = message.tool_calls.map(validateToolCall);
    }
    return result;
  });
  const tools: ModelTool[] = obj.tools.map((value) => {
    const tool = record(value, 'tool');
    if (tool.type !== 'function') invalid('仅支持 function tools');
    const fn = record(tool.function, 'tool.function');
    const name = textValue(fn.name, 'tool name', 200);
    if (!/^[a-zA-Z0-9_-]{1,200}$/.test(name)) invalid('tool name 格式无效');
    const parameters = record(fn.parameters, 'parameters');
    if (
      parameters.type !== 'object' ||
      JSON.stringify(parameters).length > 20000
    )
      invalid('parameters 必须为有界 object schema');
    return {
      type: 'function',
      function: {
        name,
        description: textValue(fn.description, 'description', 4000),
        parameters: parameters as ModelTool['function']['parameters'],
      },
    };
  });
  if (new Set(tools.map((tool) => tool.function.name)).size !== tools.length)
    invalid('tools name 不可重复');
  return { messages, tools };
}

/** A transport-only model proxy. Browser WebMCP owns all tool execution. */
export async function requestAgent(
  value: unknown,
  env: ModelEnvironment = readModelEnvironment(),
  fetcher: typeof fetch = fetch,
): Promise<AgentResponse> {
  const request = validateAgentRequest(value);
  const status = modelStatus(env);
  if (!status.configured)
    throw new HttpError(
      503,
      'MODEL_NOT_CONFIGURED',
      '尚未配置模型。请设置 MODEL_API_KEY，或在界面选择明确标注的场景回放。',
    );
  const base = (env.MODEL_BASE_URL || 'https://api.openai.com/v1').replace(
    /\/+$/,
    '',
  );
  let url: URL;
  try {
    url = new URL(
      base.endsWith('/chat/completions') ? base : `${base}/chat/completions`,
    );
  } catch {
    throw new HttpError(
      503,
      'MODEL_CONFIGURATION_ERROR',
      'MODEL_BASE_URL 不是有效的 URL',
    );
  }
  if (!['http:', 'https:'].includes(url.protocol))
    throw new HttpError(
      503,
      'MODEL_CONFIGURATION_ERROR',
      'MODEL_BASE_URL 必须使用 HTTP 或 HTTPS',
    );
  try {
    const response = await fetcher(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${env.MODEL_API_KEY!.trim()}`,
      },
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify({
        model: status.model,
        messages: [
          {
            role: 'system',
            content:
              '你是购物工作台中的助手。使用浏览器实际提供的工具完成用户请求。工具由当前页面的 WebMCP registry 执行，必要时先使用导航或发现工具。不能假装调用工具、编造结果或自行假设未注册的工具。涉及用户偏好写入，只执行用户明确要求的修改。中文回答，简洁说明结果。',
          },
          ...request.messages,
        ],
        ...(request.tools.length
          ? { tools: request.tools, tool_choice: 'auto' }
          : {}),
        stream: false,
      }),
    });
    if (!response.ok)
      throw new HttpError(
        502,
        'MODEL_UPSTREAM_ERROR',
        `模型服务返回 HTTP ${response.status}。请检查服务配置或稍后重试。`,
      );
    const payload = (await response.json()) as {
      choices?: { message?: unknown }[];
    };
    const message = record(payload.choices?.[0]?.message, 'model message');
    const calls =
      message.tool_calls === undefined
        ? undefined
        : Array.isArray(message.tool_calls) && message.tool_calls.length <= 20
          ? message.tool_calls.map(validateToolCall)
          : invalid('模型 tool_calls 无效');
    const content =
      message.content === null || message.content === undefined
        ? null
        : textValue(message.content, 'model content', 60000);
    if (!content && !calls?.length)
      throw new HttpError(502, 'MODEL_EMPTY_RESPONSE', '模型返回了空响应');
    return {
      message: {
        role: 'assistant',
        content,
        ...(calls?.length ? { tool_calls: calls } : {}),
      },
      model: status.model,
    };
  } catch (error) {
    if (error instanceof HttpError && error.status !== 400) throw error;
    throw new HttpError(
      502,
      'MODEL_UPSTREAM_ERROR',
      error instanceof Error && error.name === 'TimeoutError'
        ? '模型请求超时，请重试。'
        : '模型响应无效或暂时不可达。',
    );
  }
}
