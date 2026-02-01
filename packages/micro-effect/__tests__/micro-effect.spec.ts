import { Effect, TaggedError } from '../src/index';

describe('micro-effect', () => {
  describe('Effect.succeed', () => {
    it('resolves with the provided value', async () => {
      const result = await Effect.runPromise(Effect.succeed(42));
      expect(result).toBe(42);
    });
  });

  describe('Effect.fail', () => {
    it('rejects with the provided error', async () => {
      await expect(Effect.runPromise(Effect.fail('boom'))).rejects.toBe('boom');
    });
  });

  describe('Effect.sync', () => {
    it('executes the thunk and returns its value', async () => {
      const result = await Effect.runPromise(Effect.sync(() => 'hello'));
      expect(result).toBe('hello');
    });
  });

  describe('Effect.promise', () => {
    it('awaits the async thunk', async () => {
      const result = await Effect.runPromise(
        Effect.promise(() => Promise.resolve('async-value')),
      );
      expect(result).toBe('async-value');
    });
  });

  describe('Effect.tryPromise', () => {
    it('returns the value on success', async () => {
      const result = await Effect.runPromise(
        Effect.tryPromise({
          try: () => Promise.resolve(10),
          catch: () => 'mapped-error',
        }),
      );
      expect(result).toBe(10);
    });

    it('maps the error on failure', async () => {
      await expect(
        Effect.runPromise(
          Effect.tryPromise({
            try: () => Promise.reject(new Error('original')),
            catch: (err) => `mapped: ${(err as Error).message}`,
          }),
        ),
      ).rejects.toBe('mapped: original');
    });
  });

  describe('Effect.gen', () => {
    it('chains multiple yielded effects', async () => {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const a = yield* Effect.succeed(1);
          const b = yield* Effect.succeed(2);
          return a + b;
        }),
      );
      expect(result).toBe(3);
    });

    it('propagates errors from failed effects via catch', async () => {
      const program = Effect.gen(function* () {
        const a = yield* Effect.succeed(1);
        const inner = Effect.tryPromise({
          try: () => Promise.reject(new Error('async-fail')),
          catch: (err) => (err as Error).message,
        }).pipe(Effect.catch((err) => Effect.succeed(`recovered: ${err}`)));
        const b = yield* inner;
        return `${a}-${b}`;
      });
      const result = await Effect.runPromise(program);
      expect(result).toBe('1-recovered: async-fail');
    });
  });

  describe('Effect.catchTag', () => {
    it('catches errors with matching _tag (data-last via pipe)', async () => {
      const MyError = TaggedError('MyError');
      const program = Effect.fail(new MyError()).pipe(
        Effect.catchTag('MyError', () => Effect.succeed('recovered')),
      );
      const result = await Effect.runPromise(program);
      expect(result).toBe('recovered');
    });

    it('rethrows errors with non-matching _tag', async () => {
      const MyError = TaggedError('MyError');
      const program = Effect.fail(new MyError()).pipe(
        Effect.catchTag('OtherError', () => Effect.succeed('recovered')),
      );
      await expect(Effect.runPromise(program)).rejects.toBeInstanceOf(Error);
    });
  });

  describe('Effect.catch', () => {
    it('catches all errors (data-last via pipe)', async () => {
      const program = Effect.fail('any-error').pipe(
        Effect.catch(() => Effect.succeed('caught')),
      );
      const result = await Effect.runPromise(program);
      expect(result).toBe('caught');
    });

    it('works in data-first form', async () => {
      const result = await Effect.runPromise(
        Effect.catch(Effect.fail('err'), () => Effect.succeed('caught-first')),
      );
      expect(result).toBe('caught-first');
    });
  });

  describe('Effect.runPromise', () => {
    it('returns a Promise', () => {
      const result = Effect.runPromise(Effect.succeed(1));
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('TaggedError', () => {
    it('creates an error with _tag and extends Error', () => {
      const MyErr = TaggedError('MyErr');
      const err = new MyErr();
      expect(err).toBeInstanceOf(Error);
      expect(err._tag).toBe('MyErr');
      expect(err.name).toBe('MyErr');
    });

    it('assigns constructor properties', () => {
      const MyErr = TaggedError('MyErr');
      const err = new MyErr({ code: 42 });
      expect((err as any).code).toBe(42);
      expect(err._tag).toBe('MyErr');
    });

    it('is yieldable in gen via Symbol.iterator and catchable via catchTag', async () => {
      const MyErr = TaggedError('MyErr');
      const program = Effect.gen(function* () {
        const inner = Effect.fail(new MyErr({ code: 99 })).pipe(
          Effect.catchTag('MyErr', (err) =>
            Effect.succeed(`caught: ${(err as any).code}`),
          ),
        );
        return yield* inner;
      });
      const result = await Effect.runPromise(program);
      expect(result).toBe('caught: 99');
    });
  });

  describe('pipe', () => {
    it('chains multiple operations', async () => {
      const result = await Effect.runPromise(
        Effect.succeed(5).pipe(
          (eff) =>
            Effect.gen(function* () {
              const val = yield* eff;
              return val * 2;
            }),
          (eff) =>
            Effect.gen(function* () {
              const val = yield* eff;
              return val + 1;
            }),
        ),
      );
      expect(result).toBe(11);
    });
  });

  describe('yield* protocol', () => {
    it('single-shot iterator works correctly', async () => {
      const eff = Effect.succeed(99);
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const val = yield* eff;
          return val;
        }),
      );
      expect(result).toBe(99);
    });
  });

  describe('Effect.forEach', () => {
    it('processes items in parallel by default', async () => {
      const result = await Effect.runPromise(
        Effect.forEach([1, 2, 3], (item) => Effect.succeed(item * 2)),
      );
      expect(result).toEqual([2, 4, 6]);
    });

    it('processes items in parallel explicitly', async () => {
      const result = await Effect.runPromise(
        Effect.forEach(
          [10, 20, 30],
          (item, index) => Effect.succeed(item + index),
          { concurrency: 'parallel' },
        ),
      );
      expect(result).toEqual([10, 21, 32]);
    });

    it('processes items sequentially', async () => {
      const order: number[] = [];
      const result = await Effect.runPromise(
        Effect.forEach(
          [1, 2, 3],
          (item) =>
            Effect.promise(async () => {
              order.push(item);
              return item * 10;
            }),
          { concurrency: 'sequential' },
        ),
      );
      expect(result).toEqual([10, 20, 30]);
      expect(order).toEqual([1, 2, 3]);
    });

    it('propagates errors', async () => {
      const MyErr = TaggedError('MyErr');
      await expect(
        Effect.runPromise(
          Effect.forEach([1, 2, 3], (item) => {
            if (item === 2) return Effect.fail(new MyErr());
            return Effect.succeed(item);
          }),
        ),
      ).rejects.toBeInstanceOf(Error);
    });

    it('works with empty array', async () => {
      const result = await Effect.runPromise(
        Effect.forEach([], (item: number) => Effect.succeed(item)),
      );
      expect(result).toEqual([]);
    });
  });

  describe('Effect.tap', () => {
    it('executes side-effect and returns original value (data-first)', async () => {
      let sideEffect = 0;
      const result = await Effect.runPromise(
        Effect.tap(Effect.succeed(42), (val) =>
          Effect.sync(() => {
            sideEffect = val;
          }),
        ),
      );
      expect(result).toBe(42);
      expect(sideEffect).toBe(42);
    });

    it('executes side-effect and returns original value (data-last via pipe)', async () => {
      let sideEffect = '';
      const result = await Effect.runPromise(
        Effect.succeed('hello').pipe(
          Effect.tap((val) =>
            Effect.sync(() => {
              sideEffect = val;
            }),
          ),
        ),
      );
      expect(result).toBe('hello');
      expect(sideEffect).toBe('hello');
    });

    it('propagates errors from the tap function', async () => {
      await expect(
        Effect.runPromise(
          Effect.tap(Effect.succeed(1), () => Effect.fail('tap-error')),
        ),
      ).rejects.toBe('tap-error');
    });
  });

  describe('Effect.all', () => {
    it('runs all effects in parallel and collects results', async () => {
      const result = await Effect.runPromise(
        Effect.all([
          Effect.succeed(1),
          Effect.succeed('two'),
          Effect.succeed(true),
        ]),
      );
      expect(result).toEqual([1, 'two', true]);
    });

    it('propagates errors', async () => {
      await expect(
        Effect.runPromise(
          Effect.all([
            Effect.succeed(1),
            Effect.fail('boom'),
            Effect.succeed(3),
          ]),
        ),
      ).rejects.toBe('boom');
    });

    it('works with empty array', async () => {
      const result = await Effect.runPromise(Effect.all([]));
      expect(result).toEqual([]);
    });
  });

  describe('Effect.trySync', () => {
    it('returns value on success', async () => {
      const result = await Effect.runPromise(
        Effect.trySync({
          try: () => 42,
          catch: () => 'error',
        }),
      );
      expect(result).toBe(42);
    });

    it('maps error on failure', async () => {
      await expect(
        Effect.runPromise(
          Effect.trySync({
            try: () => {
              throw new Error('original');
            },
            catch: (err) => `mapped: ${(err as Error).message}`,
          }),
        ),
      ).rejects.toBe('mapped: original');
    });
  });
});
