import path from 'node:path';
import { it, expect, describe, rs, beforeEach } from '@rstest/core';
import { createStaticMiddleware } from './staticMiddleware';

rs.mock('./fileCache', () => ({
  fileCache: {
    getFile: rs.fn(),
  },
}));

import { fileCache } from './fileCache';

describe('staticMiddleware', () => {
  let middleware: any;
  let mockContext: any;
  let nextSpy: any;
  const pwd = '/test/path';
  const bundlesRoot = path.resolve(pwd, 'bundles');

  beforeEach(() => {
    rs.clearAllMocks();

    middleware = createStaticMiddleware({
      assetPrefix: '',
      pwd,
    });

    nextSpy = rs.fn();
    mockContext = {
      req: {
        path: '',
      },
      header: rs.fn(),
      body: rs.fn(),
    };
  });

  describe('file extension filtering', () => {
    it('should call next() for non-js files', async () => {
      mockContext.req.path = '/bundles/test.css';

      await middleware(mockContext, nextSpy);

      expect(nextSpy).toHaveBeenCalledOnce();
      expect(mockContext.header).not.toHaveBeenCalled();
      expect(mockContext.body).not.toHaveBeenCalled();
    });

    it('should call next() for files without extension', async () => {
      mockContext.req.path = '/bundles/test';

      await middleware(mockContext, nextSpy);

      expect(nextSpy).toHaveBeenCalledOnce();
      expect(mockContext.header).not.toHaveBeenCalled();
      expect(mockContext.body).not.toHaveBeenCalled();
    });

    it('should process .js files', async () => {
      mockContext.req.path = '/bundles/test.js';
      (fileCache.getFile as any).mockResolvedValue(null);

      await middleware(mockContext, nextSpy);

      expect(fileCache.getFile).toHaveBeenCalledWith(
        path.resolve(bundlesRoot, 'test.js'),
      );
    });
  });

  describe('asset prefix filtering', () => {
    it('should call next() for paths not starting with /bundles', async () => {
      mockContext.req.path = '/assets/test.js';

      await middleware(mockContext, nextSpy);

      expect(nextSpy).toHaveBeenCalledOnce();
      expect(fileCache.getFile).not.toHaveBeenCalled();
      expect(mockContext.header).not.toHaveBeenCalled();
      expect(mockContext.body).not.toHaveBeenCalled();
    });

    it('should call next() for root path', async () => {
      mockContext.req.path = '/test.js';

      await middleware(mockContext, nextSpy);

      expect(nextSpy).toHaveBeenCalledOnce();
      expect(fileCache.getFile).not.toHaveBeenCalled();
    });

    it('should process paths starting with /bundles', async () => {
      mockContext.req.path = '/bundles/test.js';
      (fileCache.getFile as any).mockResolvedValue(null);

      await middleware(mockContext, nextSpy);

      expect(fileCache.getFile).toHaveBeenCalledWith(
        path.resolve(bundlesRoot, 'test.js'),
      );
    });
  });

  describe('path traversal protection', () => {
    it('should call next() for parent-directory escapes', async () => {
      mockContext.req.path = '/bundles/../secret.js';

      await middleware(mockContext, nextSpy);

      expect(nextSpy).toHaveBeenCalledOnce();
      expect(fileCache.getFile).not.toHaveBeenCalled();
    });

    it('should call next() for nested parent-directory escapes', async () => {
      mockContext.req.path = '/bundles/foo/../../etc/passwd.js';

      await middleware(mockContext, nextSpy);

      expect(nextSpy).toHaveBeenCalledOnce();
      expect(fileCache.getFile).not.toHaveBeenCalled();
    });

    it('should allow a file whose name starts with two dots', async () => {
      mockContext.req.path = '/bundles/..chunk.js';

      await middleware(mockContext, nextSpy);

      expect(fileCache.getFile).toHaveBeenCalledWith(
        path.resolve(bundlesRoot, '..chunk.js'),
      );
      expect(nextSpy).toHaveBeenCalledOnce();
    });

    it('should allow nested files whose name starts with two dots', async () => {
      mockContext.req.path = '/bundles/..generated/app.js';

      await middleware(mockContext, nextSpy);

      expect(fileCache.getFile).toHaveBeenCalledWith(
        path.resolve(bundlesRoot, '..generated/app.js'),
      );
      expect(nextSpy).toHaveBeenCalledOnce();
    });
  });

  describe('file existence check', () => {
    it('should call next() when file does not exist', async () => {
      mockContext.req.path = '/bundles/nonexistent.js';
      (fileCache.getFile as any).mockResolvedValue(null);

      await middleware(mockContext, nextSpy);

      expect(fileCache.getFile).toHaveBeenCalledWith(
        path.resolve(bundlesRoot, 'nonexistent.js'),
      );
      expect(nextSpy).toHaveBeenCalledOnce();
      expect(mockContext.header).not.toHaveBeenCalled();
      expect(mockContext.body).not.toHaveBeenCalled();
    });

    it('should proceed to file cache when file exists', async () => {
      mockContext.req.path = '/bundles/existing.js';
      (fileCache.getFile as any).mockResolvedValue(null);

      await middleware(mockContext, nextSpy);

      expect(fileCache.getFile).toHaveBeenCalledWith(
        path.resolve(bundlesRoot, 'existing.js'),
      );
    });
  });

  describe('successful file serving', () => {
    it('should serve file content with correct headers', async () => {
      const mockFileContent = 'console.log("test");';
      const mockFileResult = {
        content: mockFileContent,
        lastModified: Date.now(),
      };

      mockContext.req.path = '/bundles/app.js';
      (fileCache.getFile as any).mockResolvedValue(mockFileResult);
      mockContext.body.mockReturnValue('response');

      const result = await middleware(mockContext, nextSpy);

      expect(fileCache.getFile).toHaveBeenCalledWith(
        path.resolve(bundlesRoot, 'app.js'),
      );
      expect(nextSpy).not.toHaveBeenCalled();

      expect(mockContext.header).toHaveBeenCalledWith(
        'Content-Type',
        'application/javascript',
      );
      expect(mockContext.header).toHaveBeenCalledWith(
        'Content-Length',
        String(Buffer.byteLength(mockFileContent)),
      );

      expect(mockContext.body).toHaveBeenCalledWith(
        mockFileResult.content,
        200,
      );
      expect(result).toBe('response');
    });

    it('should set Content-Length in bytes for non-ASCII content', async () => {
      const mockFileContent = 'console.log("中文注释");';
      const mockFileResult = {
        content: mockFileContent,
        lastModified: Date.now(),
      };

      mockContext.req.path = '/bundles/non-ascii.js';
      (fileCache.getFile as any).mockResolvedValue(mockFileResult);

      await middleware(mockContext, nextSpy);

      expect(Buffer.byteLength(mockFileContent)).toBeGreaterThan(
        mockFileContent.length,
      );
      expect(mockContext.header).toHaveBeenCalledWith(
        'Content-Length',
        String(Buffer.byteLength(mockFileContent)),
      );
    });

    it('should handle empty file content', async () => {
      const mockFileResult = {
        content: '',
        lastModified: Date.now(),
      };

      mockContext.req.path = '/bundles/empty.js';
      (fileCache.getFile as any).mockResolvedValue(mockFileResult);
      mockContext.body.mockReturnValue('empty-response');

      const result = await middleware(mockContext, nextSpy);

      expect(mockContext.header).toHaveBeenCalledWith('Content-Length', '0');
      expect(mockContext.body).toHaveBeenCalledWith(
        mockFileResult.content,
        200,
      );
      expect(result).toBe('empty-response');
      expect(nextSpy).not.toHaveBeenCalled();
    });
  });

  describe('asset prefix handling', () => {
    it('should handle custom asset prefix correctly', async () => {
      const customMiddleware = createStaticMiddleware({
        assetPrefix: '/custom-prefix',
        pwd,
      });

      mockContext.req.path = '/bundles/test.js';
      await customMiddleware(mockContext, nextSpy);

      expect(nextSpy).toHaveBeenCalledOnce();
      expect(mockContext.header).not.toHaveBeenCalled();
      expect(mockContext.body).not.toHaveBeenCalled();
    });

    it('should handle asset prefix removal correctly', async () => {
      const customMiddleware = createStaticMiddleware({
        assetPrefix: '/prefix',
        pwd,
      });

      const mockFileResult = {
        content: 'test content',
        lastModified: Date.now(),
      };

      mockContext.req.path = '/prefix/bundles/test.js';
      (fileCache.getFile as any).mockResolvedValue(mockFileResult);

      await customMiddleware(mockContext, nextSpy);

      expect(fileCache.getFile).toHaveBeenCalledWith(
        path.resolve(bundlesRoot, 'test.js'),
      );
    });
  });
});
