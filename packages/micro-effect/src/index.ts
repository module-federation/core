// Micro Effect runtime for Module Federation
// Drop-in replacement for effect-smol with minimal footprint (~2KB minified)

// ---- Internal variant types ----

interface Succeed<A> {
  readonly _tag: 'Succeed';
  readonly value: A;
}
interface Fail<E> {
  readonly _tag: 'Fail';
  readonly error: E;
}
interface Sync<A> {
  readonly _tag: 'Sync';
  readonly thunk: () => A;
}
interface EffPromise<A> {
  readonly _tag: 'Promise';
  readonly thunk: () => Promise<A>;
}
interface TryPromise<A, E> {
  readonly _tag: 'TryPromise';
  readonly tryFn: () => Promise<A>;
  readonly catchFn: (error: unknown) => E;
}
interface Gen<A> {
  readonly _tag: 'Gen';
  readonly body: () => Generator<MFEffect<any, any>, A, any>;
}
interface CatchTag<A2> {
  readonly _tag: 'CatchTag';
  readonly self: MFEffect<any, any>;
  readonly targetTag: string;
  readonly handler: (err: any) => MFEffect<A2, any>;
}
interface Catch<A2> {
  readonly _tag: 'Catch';
  readonly self: MFEffect<any, any>;
  readonly handler: (err: any) => MFEffect<A2, any>;
}

type EffectVariant<A, E> =
  | Succeed<A>
  | Fail<E>
  | Sync<A>
  | EffPromise<A>
  | TryPromise<A, E>
  | Gen<A>
  | CatchTag<A>
  | Catch<A>;

// ---- Prototype for pipe + iterator ----

const EffectProto = {
  pipe(this: any, ...fns: Array<(a: any) => any>): any {
    let result: any = this;
    for (let i = 0; i < fns.length; i++) {
      result = fns[i](result);
    }
    return result;
  },
  [Symbol.iterator](this: any): Iterator<any, any, any> {
    let done = false;
    const self = this;
    return {
      next(value?: any) {
        if (done) {
          return { value, done: true };
        }
        done = true;
        return { value: self, done: false };
      },
    } as Iterator<any, any, any>;
  },
};

// ---- MFEffect type (opaque) ----

interface MFEffect<A, E = never> {
  readonly _tag: string;
  pipe<B>(ab: (a: this) => B): B;
  pipe<B, C>(ab: (a: this) => B, bc: (b: B) => C): C;
  pipe<B, C, D>(ab: (a: this) => B, bc: (b: B) => C, cd: (c: C) => D): D;
  [Symbol.iterator](): Iterator<this, A, A>;
}

function makeEffect<A, E>(variant: EffectVariant<A, E>): MFEffect<A, E> {
  const eff = Object.create(EffectProto);
  Object.assign(eff, variant);
  return eff;
}

// ---- Constructors ----

function succeed<A>(value: A): MFEffect<A, never> {
  return makeEffect<A, never>({ _tag: 'Succeed', value });
}

function fail<E>(error: E): MFEffect<never, E> {
  return makeEffect<never, E>({ _tag: 'Fail', error });
}

function sync<A>(thunk: () => A): MFEffect<A, never> {
  return makeEffect<A, never>({ _tag: 'Sync', thunk });
}

function promise<A>(thunk: () => Promise<A>): MFEffect<A, never> {
  return makeEffect<A, never>({ _tag: 'Promise', thunk });
}

function tryPromise<A, E>(options: {
  try: () => Promise<A>;
  catch: (error: unknown) => E;
}): MFEffect<A, E> {
  return makeEffect<A, E>({
    _tag: 'TryPromise',
    tryFn: options.try,
    catchFn: options.catch,
  });
}

function gen<A, E>(
  body: () => Generator<MFEffect<any, any>, A, any>,
): MFEffect<A, E> {
  return makeEffect<A, E>({ _tag: 'Gen', body } as any);
}

// ---- Interpreter ----

async function interpret<A, E>(effect: MFEffect<A, E>): Promise<A> {
  const e = effect as any;
  switch (e._tag) {
    case 'Succeed':
      return e.value;
    case 'Fail':
      throw e.error;
    case 'Sync':
      return e.thunk();
    case 'Promise':
      return await e.thunk();
    case 'TryPromise':
      try {
        return await e.tryFn();
      } catch (err) {
        throw e.catchFn(err);
      }
    case 'Gen': {
      const iter = e.body();
      let result = iter.next();
      while (!result.done) {
        try {
          const resolved = await interpret(result.value);
          result = iter.next(resolved);
        } catch (err) {
          result = iter.throw(err);
        }
      }
      return result.value;
    }
    case 'CatchTag':
      try {
        return await interpret(e.self);
      } catch (err: any) {
        if (
          err &&
          typeof err === 'object' &&
          '_tag' in err &&
          err._tag === e.targetTag
        ) {
          return await interpret(e.handler(err));
        }
        throw err;
      }
    case 'Catch':
      try {
        return await interpret(e.self);
      } catch (err) {
        return await interpret(e.handler(err));
      }
    default:
      throw new Error(`Unknown effect tag: ${e._tag}`);
  }
}

// ---- Error recovery operators (dual-form) ----

function catchTag<A, E extends { _tag: string }, Tag extends E['_tag'], A2, E2>(
  self: MFEffect<A, E>,
  tag: Tag,
  handler: (err: Extract<E, { _tag: Tag }>) => MFEffect<A2, E2>,
): MFEffect<A | A2, Exclude<E, { _tag: Tag }> | E2>;
function catchTag<E extends { _tag: string }, Tag extends E['_tag'], A2, E2>(
  tag: Tag,
  handler: (err: Extract<E, { _tag: Tag }>) => MFEffect<A2, E2>,
): <A>(
  self: MFEffect<A, E>,
) => MFEffect<A | A2, Exclude<E, { _tag: Tag }> | E2>;
function catchTag(...args: any[]): any {
  if (args.length === 3) {
    const [self, tag, handler] = args;
    return makeEffect({ _tag: 'CatchTag', self, targetTag: tag, handler });
  }
  const [tag, handler] = args;
  return (self: any) =>
    makeEffect({ _tag: 'CatchTag', self, targetTag: tag, handler });
}

function catch_<A, E, A2, E2>(
  self: MFEffect<A, E>,
  handler: (err: E) => MFEffect<A2, E2>,
): MFEffect<A | A2, E2>;
function catch_<E, A2, E2>(
  handler: (err: E) => MFEffect<A2, E2>,
): <A>(self: MFEffect<A, E>) => MFEffect<A | A2, E2>;
function catch_(...args: any[]): any {
  if (
    args.length === 2 &&
    args[0] &&
    typeof args[0] === 'object' &&
    'pipe' in args[0]
  ) {
    const [self, handler] = args;
    return makeEffect({ _tag: 'Catch', self, handler });
  }
  const [handler] = args;
  return (self: any) => makeEffect({ _tag: 'Catch', self, handler });
}

// ---- Run ----

function runPromise<A, E>(effect: MFEffect<A, E>): Promise<A> {
  return interpret(effect);
}

// ---- TaggedError factory ----

export function TaggedError<Tag extends string>(
  tag: Tag,
): new (args?: any) => Error & { readonly _tag: Tag } {
  class TaggedErr extends Error {
    readonly _tag = tag;
    constructor(args?: any) {
      super(tag);
      this.name = tag;
      if (args) Object.assign(this, args);
    }
    [Symbol.iterator]() {
      return fail(this)[Symbol.iterator]();
    }
  }
  return TaggedErr as any;
}

// ---- Public namespace (drop-in compatible) ----

export const Effect = {
  gen,
  succeed,
  fail,
  sync,
  promise,
  tryPromise,
  catchTag,
  catch: catch_,
  runPromise,
};

export namespace Effect {
  export type Effect<A, E = never> = MFEffect<A, E>;
}
