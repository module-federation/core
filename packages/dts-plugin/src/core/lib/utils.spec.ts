import { it, expect, vi } from 'vitest';
import http from 'http';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { axiosGet } from './utils';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: 'mocked response' })),
  },
}));

vi.mock('https-proxy-agent', () => ({
  HttpsProxyAgent: vi.fn(),
}));

it('axiosGet should use agents with family set to 4', async () => {
  const httpSpy = vi.spyOn(http, 'Agent');
  const httpsSpy = vi.spyOn(https, 'Agent');

  await axiosGet('http://localhost');

  expect(httpSpy).toHaveBeenCalledWith({ family: 4 });
  expect(httpsSpy).toHaveBeenCalledWith({ family: 4 });

  httpSpy.mockRestore();
  httpsSpy.mockRestore();
});

it('axiosGet should allow to use agents with family set to 6', async () => {
  const httpSpy = vi.spyOn(http, 'Agent');
  const httpsSpy = vi.spyOn(https, 'Agent');

  await axiosGet('http://localhost', { family: 6 });

  expect(httpSpy).toHaveBeenCalledWith({ family: 6 });
  expect(httpsSpy).toHaveBeenCalledWith({ family: 6 });

  httpSpy.mockRestore();
  httpsSpy.mockRestore();
});

it('axiosGet should use HttpsProxyAgent when HTTP_PROXY is set', async () => {
  const originalHttpProxy = process.env.HTTP_PROXY;
  process.env.HTTP_PROXY = 'http://proxy.company.com:8080';

  const httpSpy = vi.spyOn(http, 'Agent');
  const httpsProxyAgentSpy = vi.mocked(HttpsProxyAgent);

  await axiosGet('https://example.com');

  expect(httpSpy).toHaveBeenCalledWith({ family: 4 });
  expect(httpsProxyAgentSpy).toHaveBeenCalledWith(
    'http://proxy.company.com:8080',
    { family: 4 },
  );

  // Restore environment variable
  if (originalHttpProxy !== undefined) {
    process.env.HTTP_PROXY = originalHttpProxy;
  } else {
    delete process.env.HTTP_PROXY;
  }

  httpSpy.mockRestore();
});

it('axiosGet should use HttpsProxyAgent when HTTPS_PROXY is set', async () => {
  const originalHttpsProxy = process.env.HTTPS_PROXY;
  process.env.HTTPS_PROXY = 'http://proxy.company.com:8080';

  const httpSpy = vi.spyOn(http, 'Agent');
  const httpsProxyAgentSpy = vi.mocked(HttpsProxyAgent);

  await axiosGet('https://example.com');

  expect(httpSpy).toHaveBeenCalledWith({ family: 4 });
  expect(httpsProxyAgentSpy).toHaveBeenCalledWith(
    'http://proxy.company.com:8080',
    { family: 4 },
  );

  // Restore environment variable
  if (originalHttpsProxy !== undefined) {
    process.env.HTTPS_PROXY = originalHttpsProxy;
  } else {
    delete process.env.HTTPS_PROXY;
  }

  httpSpy.mockRestore();
});

it('axiosGet should prefer HTTPS_PROXY over HTTP_PROXY when both are set', async () => {
  const originalHttpProxy = process.env.HTTP_PROXY;
  const originalHttpsProxy = process.env.HTTPS_PROXY;

  process.env.HTTP_PROXY = 'http://proxy1.company.com:8080';
  process.env.HTTPS_PROXY = 'http://proxy2.company.com:8080';

  const httpSpy = vi.spyOn(http, 'Agent');
  const httpsProxyAgentSpy = vi.mocked(HttpsProxyAgent);

  await axiosGet('https://example.com');

  expect(httpSpy).toHaveBeenCalledWith({ family: 4 });
  expect(httpsProxyAgentSpy).toHaveBeenCalledWith(
    'http://proxy2.company.com:8080',
    { family: 4 },
  );

  // Restore environment variables
  if (originalHttpProxy !== undefined) {
    process.env.HTTP_PROXY = originalHttpProxy;
  } else {
    delete process.env.HTTP_PROXY;
  }
  if (originalHttpsProxy !== undefined) {
    process.env.HTTPS_PROXY = originalHttpsProxy;
  } else {
    delete process.env.HTTPS_PROXY;
  }

  httpSpy.mockRestore();
});

it('axiosGet should use standard https.Agent when no proxy is configured', async () => {
  const originalHttpProxy = process.env.HTTP_PROXY;
  const originalHttpsProxy = process.env.HTTPS_PROXY;
  const originalHttpProxyLower = process.env.http_proxy;
  const originalHttpsProxyLower = process.env.https_proxy;

  // Clear all proxy environment variables
  delete process.env.HTTP_PROXY;
  delete process.env.HTTPS_PROXY;
  delete process.env.http_proxy;
  delete process.env.https_proxy;

  const httpSpy = vi.spyOn(http, 'Agent');
  const httpsSpy = vi.spyOn(https, 'Agent');
  const httpsProxyAgentSpy = vi.mocked(HttpsProxyAgent);

  await axiosGet('https://example.com');

  expect(httpSpy).toHaveBeenCalledWith({ family: 4 });
  expect(httpsSpy).toHaveBeenCalledWith({ family: 4 });
  expect(httpsProxyAgentSpy).not.toHaveBeenCalled();

  // Restore environment variables
  if (originalHttpProxy !== undefined) {
    process.env.HTTP_PROXY = originalHttpProxy;
  }
  if (originalHttpsProxy !== undefined) {
    process.env.HTTPS_PROXY = originalHttpsProxy;
  }
  if (originalHttpProxyLower !== undefined) {
    process.env.http_proxy = originalHttpProxyLower;
  }
  if (originalHttpsProxyLower !== undefined) {
    process.env.https_proxy = originalHttpsProxyLower;
  }

  httpSpy.mockRestore();
  httpsSpy.mockRestore();
});
