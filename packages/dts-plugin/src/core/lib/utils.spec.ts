import { it, expect, vi } from 'vitest';
import http from 'http';
import { axiosGet } from './utils';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: 'mocked response' })),
  },
}));

it('axiosGet should use agents with family set to 4', async () => {
  const httpSpy = vi.spyOn(http, 'Agent');

  await axiosGet('http://localhost');

  expect(httpSpy).toHaveBeenCalledWith({ family: 4 });

  httpSpy.mockRestore();
});
