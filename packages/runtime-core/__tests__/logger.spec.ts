import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { error, warn, assert, logger } from '../src/utils/logger';

const LOG_CATEGORY = '[ Federation Runtime ]';

describe('logger', () => {
  describe('error function', () => {
    it('should add prefix to string messages', () => {
      expect(() => error('test error')).toThrow(`${LOG_CATEGORY}: test error`);
    });

    it('should add prefix to Error objects and mutate them', () => {
      const originalError = new Error('test error');

      try {
        error(originalError);
      } catch (e: any) {
        expect(e).toBe(originalError); // Same reference
        expect(e.message).toBe(`${LOG_CATEGORY}: test error`);
        // Original error is mutated
        expect(originalError.message).toBe(`${LOG_CATEGORY}: test error`);
      }
    });

    it('should not add duplicate prefix', () => {
      const errorWithPrefix = new Error(`${LOG_CATEGORY}: already prefixed`);

      try {
        error(errorWithPrefix);
      } catch (e: any) {
        expect(e.message).toBe(`${LOG_CATEGORY}: already prefixed`);
        expect(e.message).not.toContain(`${LOG_CATEGORY}: ${LOG_CATEGORY}:`);
      }
    });

    it('should preserve custom error properties', () => {
      class CustomError extends Error {
        code: string;
        constructor(message: string, code: string) {
          super(message);
          this.code = code;
        }
      }

      const customError = new CustomError('custom error', 'CUSTOM_CODE');

      try {
        error(customError);
      } catch (e: any) {
        expect(e).toBe(customError); // Same reference
        expect(e).toBeInstanceOf(CustomError);
        expect(e.code).toBe('CUSTOM_CODE');
        expect(e.message).toBe(`${LOG_CATEGORY}: custom error`);
      }
    });

    it('should handle non-Error objects', () => {
      expect(() => error({ custom: 'object' })).toThrow(
        `${LOG_CATEGORY}: [object Object]`,
      );
      expect(() => error(123)).toThrow(`${LOG_CATEGORY}: 123`);
      expect(() => error(null)).toThrow(`${LOG_CATEGORY}: null`);
      expect(() => error(undefined)).toThrow(`${LOG_CATEGORY}: undefined`);
    });

    it('should not add duplicate prefix when re-thrown', () => {
      const originalError = new Error('test error');

      // First throw
      try {
        error(originalError);
      } catch (e1: any) {
        expect(e1.message).toBe(`${LOG_CATEGORY}: test error`);

        // Second throw - should not add another prefix
        try {
          error(e1);
        } catch (e2: any) {
          expect(e2).toBe(e1); // Same reference
          expect(e2.message).toBe(`${LOG_CATEGORY}: test error`);
          expect(e2.message).not.toContain(`${LOG_CATEGORY}: ${LOG_CATEGORY}:`);
        }
      }
    });
  });

  describe('warn function', () => {
    let originalWarn: any;

    beforeEach(() => {
      originalWarn = logger.warn;
      logger.warn = vi.fn();
    });

    afterEach(() => {
      logger.warn = originalWarn;
    });

    it('should handle Error objects with prefix', () => {
      const testError = new Error('warning message');
      warn(testError);

      // Check that logger.warn was called
      expect(logger.warn).toHaveBeenCalled();
      const warnedError = (logger.warn as any).mock.calls[0][0];
      expect(warnedError.message).toBe(`${LOG_CATEGORY}: warning message`);
    });

    it('should not add duplicate prefix to warnings', () => {
      const errorWithPrefix = new Error(
        `${LOG_CATEGORY}: already prefixed warning`,
      );
      warn(errorWithPrefix);

      const warnedError = (logger.warn as any).mock.calls[0][0];
      expect(warnedError).toBe(errorWithPrefix); // Same reference since no duplication
      expect(warnedError.message).toBe(
        `${LOG_CATEGORY}: already prefixed warning`,
      );
      expect(warnedError.message).not.toContain(
        `${LOG_CATEGORY}: ${LOG_CATEGORY}:`,
      );
    });

    it('should handle non-Error objects in warn', () => {
      warn('simple string warning');
      expect(logger.warn).toHaveBeenCalledWith('simple string warning');
    });
  });

  describe('assert function', () => {
    it('should throw error when condition is false', () => {
      expect(() => assert(false, 'assertion failed')).toThrow(
        `${LOG_CATEGORY}: assertion failed`,
      );
    });

    it('should not throw when condition is true', () => {
      expect(() => assert(true, 'should not throw')).not.toThrow();
    });

    it('should work with truthy values', () => {
      expect(() => assert(1, 'should not throw')).not.toThrow();
      expect(() => assert('string', 'should not throw')).not.toThrow();
      expect(() => assert({}, 'should not throw')).not.toThrow();
      expect(() => assert([], 'should not throw')).not.toThrow();
    });

    it('should throw with falsy values', () => {
      expect(() => assert(0, 'zero assertion')).toThrow(
        `${LOG_CATEGORY}: zero assertion`,
      );
      expect(() => assert('', 'empty string assertion')).toThrow(
        `${LOG_CATEGORY}: empty string assertion`,
      );
      expect(() => assert(null, 'null assertion')).toThrow(
        `${LOG_CATEGORY}: null assertion`,
      );
      expect(() => assert(undefined, 'undefined assertion')).toThrow(
        `${LOG_CATEGORY}: undefined assertion`,
      );
    });
  });
});
