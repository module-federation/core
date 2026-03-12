const FETCH_TIMEOUT_MS = 5000;

async function fetchHeadContentLengthWithTimeout(
  url: URL,
  timeoutMs: number,
): Promise<number | null> {
  try {
    if (
      typeof window === 'undefined' ||
      typeof AbortController === 'undefined'
    ) {
      const resp = await fetch(url.href, { method: 'HEAD' });
      const lenHeader =
        resp.headers.get('Content-Length') ??
        resp.headers.get('content-length');
      if (!lenHeader) return null;
      const parsed = Number(lenHeader);
      if (Number.isNaN(parsed) || parsed <= 0) return null;
      return parsed;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resp = await fetch(url.href, {
        method: 'HEAD',
        signal: controller.signal,
      });
      const lenHeader =
        resp.headers.get('Content-Length') ??
        resp.headers.get('content-length');
      if (!lenHeader) return null;
      const parsed = Number(lenHeader);
      if (Number.isNaN(parsed) || parsed <= 0) return null;
      return parsed;
    } finally {
      window.clearTimeout(timeoutId);
    }
  } catch {
    return null;
  }
}

export type SizeSource = 'performance' | 'head' | 'estimated' | 'unknown';

export type SizeStatus = 'ok' | 'restricted' | 'unavailable';

export interface LibResourceRecord {
  id: string;
  url: string;
  libraries: string[];
  transferSize: number | null;
  encodedBodySize: number | null;
  decodedBodySize: number | null;
  sizeSource: SizeSource;
  sizeStatus: SizeStatus;
  notes?: string;
  duration: number;
  content?: string;
}

async function resolveSizes(
  entry: PerformanceResourceTiming,
  url: URL,
  scriptText: string,
): Promise<{
  transferSize: number | null;
  encodedBodySize: number | null;
  decodedBodySize: number | null;
  sizeSource: SizeSource;
  sizeStatus: SizeStatus;
  notes?: string;
  duration: number;
}> {
  let transferSize = entry.transferSize || 0;
  let encodedBodySize = entry.encodedBodySize || 0;
  let decodedBodySize = entry.decodedBodySize || 0;
  const duration = entry.duration || 0;

  let sizeSource: SizeSource = 'unknown';
  let sizeStatus: SizeStatus = 'ok';
  let notes: string | undefined;

  const hasNonZeroPerf =
    transferSize > 0 || encodedBodySize > 0 || decodedBodySize > 0;

  if (hasNonZeroPerf) {
    sizeSource = 'performance';
  } else {
    // 如果有传入 scriptText，且没有性能数据，尝试用 scriptText 估算
    // 或者尝试 HEAD 请求
    // 优先尝试 HEAD，因为更准确反映传输大小（如果有压缩）

    // 尝试通过 HEAD 获取 Content-Length（带超时）
    const contentLength = await fetchHeadContentLengthWithTimeout(
      url,
      FETCH_TIMEOUT_MS,
    );

    if (contentLength !== null) {
      transferSize = transferSize || contentLength;
      encodedBodySize = encodedBodySize || contentLength;
      sizeSource = 'head';
      sizeStatus = 'restricted';
      notes = 'Performance 体积为 0，使用 HEAD Content-Length 作为回退。';
    } else if (scriptText) {
      // 使用 TextEncoder 估算字节数
      try {
        const encoder = new TextEncoder();
        const estimatedBytes = encoder.encode(scriptText).length;
        if (estimatedBytes > 0) {
          transferSize = transferSize || estimatedBytes;
          encodedBodySize = encodedBodySize || estimatedBytes;
          decodedBodySize = decodedBodySize || estimatedBytes;
          sizeSource = 'estimated';
          sizeStatus = 'restricted';
          notes = '无法从浏览器获取准确体积，使用 TextEncoder 估算字节数。';
        } else {
          sizeStatus = 'unavailable';
          notes = '无法从 Performance、HEAD 或估算中获取脚本体积。';
        }
      } catch {
        sizeStatus = 'unavailable';
        notes = '当前环境不支持 TextEncoder 估算脚本体积。';
      }
    }
  }

  if (!transferSize && !encodedBodySize && !decodedBodySize) {
    sizeStatus = 'unavailable';
  }

  return {
    transferSize: transferSize || null,
    encodedBodySize: encodedBodySize || null,
    decodedBodySize: decodedBodySize || null,
    sizeSource,
    sizeStatus,
    notes,
    duration,
  };
}

export async function scanResources(
  keywords: string[] = [],
): Promise<LibResourceRecord[]> {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    throw new Error('当前环境不支持 Performance API，无法读取资源体积。');
  }

  if (!('getEntriesByType' in performance)) {
    throw new Error(
      '当前浏览器未暴露 performance.getEntriesByType，无法扫描资源。',
    );
  }

  const entries = performance.getEntriesByType(
    'resource',
  ) as PerformanceResourceTiming[];
  const scriptEntries = entries.filter((entry) => {
    if (entry.initiatorType === 'script') return true;
    if (entry.initiatorType === 'other') {
      const name = entry.name || '';
      return name.endsWith('.js') || name.includes('.js?');
    }
    return false;
  });
  const promises = scriptEntries.map(async (entry) => {
    let url: URL;
    try {
      url = new URL(entry.name, window.location.href);
    } catch {
      return null;
    }

    const full = url.href.toLowerCase();
    const libs = new Set<string>();

    keywords.forEach((keyword) => {
      if (full.includes(keyword.toLowerCase())) {
        libs.add(keyword);
      }
    });

    if (!libs.size) {
      // 未命中任何关键字
      return null;
    }

    let content = '';
    try {
      const resp = await fetch(url.href);
      if (resp.ok) {
        content = await resp.text();
      }
    } catch (e) {
      console.warn('Failed to fetch script content:', url.href, e);
    }
    const sizeInfo = await resolveSizes(entry, url, content);

    const record: LibResourceRecord = {
      id: url.href,
      url: url.href,
      libraries: Array.from(libs),
      transferSize: sizeInfo.transferSize,
      encodedBodySize: sizeInfo.encodedBodySize,
      decodedBodySize: sizeInfo.decodedBodySize,
      sizeSource: sizeInfo.sizeSource,
      sizeStatus: sizeInfo.sizeStatus,
      notes: sizeInfo.notes,
      duration: sizeInfo.duration,
      content: content || undefined,
    };

    return record;
  });

  const result = await Promise.all(promises);
  const filtered = result.filter((item): item is LibResourceRecord =>
    Boolean(item),
  );

  filtered.sort((a, b) => {
    const aSize = a.transferSize ?? a.encodedBodySize ?? 0;
    const bSize = b.transferSize ?? b.encodedBodySize ?? 0;
    return bSize - aSize;
  });

  return filtered;
}
