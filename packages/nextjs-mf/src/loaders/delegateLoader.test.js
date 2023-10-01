import patchDefaultSharedLoader from './delegateLoader';

describe('patchDefaultSharedLoader', () => {
  let mockContext;

  const setupMocks = (delegates, _compilerContext = '') => {
    mockContext._compiler = { context: _compilerContext };
    mockContext.getOptions.mockReturnValue({ delegates });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = {
      getOptions: jest.fn(),
      _compiler: { context: '' },
      utils: {
        contextify: jest.fn((context, absolutePath) => absolutePath),
        absolutify: jest.fn((context, request) => request),
      },
    };
  });

  const testCases = [
    // Existing test cases
    {
      name: 'Positive: should return the content with required delegates',
      content: 'content',
      delegates: {
        delegate1: 'internal delegate1?query1=value1&query2=value2',
        delegate2: 'internal delegate2',
      },
      expected: [
        "require('delegate1?query1=value1&query2=value2')",
        "require('delegate2')",
        '//hasDelegateMarkers',
        'content',
      ],
    },
    {
      name: 'Negative: should return the original content when it includes hasDelegateMarkers',
      content: 'content\n//hasDelegateMarkers',
      delegates: {
        delegate1: 'internal delegate1?query1=value1&query2=value2',
        delegate2: 'internal delegate2',
      },
      expected: 'content\n//hasDelegateMarkers',
    },
    {
      name: 'Positive: should handle empty delegates object',
      content: 'content',
      delegates: {},
      expected: ['content'],
    },
    //   {
    //     name: 'Positive: should correctly handle special characters in query string',
    //     content: 'content',
    //     delegates: {
    //       delegate1: 'internal delegate1?query1=value1&query2=value2',
    //       delegate2: 'internal delegate2?query3=value+3&query4=value%204',
    //     },
    //     expected: ["require('delegate1?query1=value1&query2=value2')", "require('delegate2?query3=value+3&query4=value%204')", '//hasDelegateMarkers', 'content'],
    //   },
    {
      name: 'Negative: should return the original content when _compiler.context is null',
      content: 'content',
      delegates: {
        delegate1: 'internal delegate1?query1=value1&query2=value2',
      },
      _compilerContext: null,
      expected: ['content'],
    },
  ];

  testCases.forEach(
    ({ name, content, delegates, _compilerContext, expected }) => {
      test(name, () => {
        setupMocks(delegates, _compilerContext);
        const result = patchDefaultSharedLoader.call(mockContext, content);

        if (Array.isArray(expected)) {
          expected.forEach((e) => {
            expect(result).toContain(e);
          });
        } else {
          expect(result).toBe(expected);
        }
      });
    },
  );
});
