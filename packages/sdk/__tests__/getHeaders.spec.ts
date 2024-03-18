import { getHeaders, HEADERS_KEY } from '../src';

describe('getHeaders', () => {
  const headers = {
    'custom-header-1': 'custom_header_value_1',
    'custom-header-2': 'custom_header_value_2',
  };
  const headersStr = JSON.stringify(headers);

  it('get headers empty object by default', () => {
    expect(getHeaders()).toEqual({});
  });

  it('get headers values by setting FEDERATION_HEADERS variable', () => {
    const prevWindow = window;
    // @ts-ignore
    delete global.window;
    process.env[HEADERS_KEY] = headersStr;
    expect(getHeaders()).toEqual(headers);
    delete process.env[HEADERS_KEY];
    global.window = prevWindow;
  });

  it(`get headers while set localStorage.${HEADERS_KEY}`, () => {
    global.window.localStorage.setItem(HEADERS_KEY, headersStr);
    expect(getHeaders()).toEqual(headers);
    global.window.localStorage.removeItem(HEADERS_KEY);
  });

  it('get headers empty object while not set localStorage.HEADERS_KEY', () => {
    global.window.localStorage.setItem(HEADERS_KEY, '{}');
    expect(getHeaders()).toEqual({});
    global.window.localStorage.removeItem(HEADERS_KEY);
  });
});
