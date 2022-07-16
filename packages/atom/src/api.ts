import { LeafAtom, DerivedAtom, SideEffectRef } from "./atom.interface";
import { LeafAtomImpl, DerivedAtomImpl } from "./atom";
import { Atom } from "./atom.interface";
import { Consumer, Producer, Runnable } from "../../util";

export type FetchStateOptionalArgs = {
  autoScope?: boolean;
};

// TODO(ericr): Support aborting
export const fetchState = <T>(
  producer: Producer<Promise<T>>,
  args?: FetchStateOptionalArgs
): Atom<T | undefined> => {
  let reactionVersion: number = 0;
  let writeVersion: number = 0;
  const atom = createState<T | undefined>(undefined, {
    autoScope: args?.autoScope,
  });

  const derivation = deriveState<Promise<T>>(producer, {
    autoScope: false,
  });
  derivation.react((futureVal: Promise<T>): void => {
    let currentReactionVersion = reactionVersion++;
    futureVal.then((val: T): void => {
      if (writeVersion > currentReactionVersion) {
        return;
      }
      atom.set(val);
      writeVersion = currentReactionVersion;
    });
  });

  (atom as any).$$$recoilFetchStateDerivation = derivation;

  return atom;
};

class Scope {
  private objects: Set<Object> = new Set<Object>();

  public collect(object: Object): void {
    this.objects.add(object);
  }

  public forEach(fn: Consumer<Object>): void {
    this.objects.forEach(fn);
  }
}

// TODO(ericr): The root level scope NEVER gets collected, so it is important that this is documented
// clearly in the public API - more so now that autoScope defaults to true!
let currentScope: Scope = new Scope();

// decorates the provided function such that all auto-scoped atoms and effects created within will
// life for at-least as long as the return value
export const createScope = <F extends (...args: any[]) => O, O extends Object>(
  fn: F
): F => {
  const privateProperty: string = "$$$recoilWithScopeDependant";

  return <F>((...args: any[]): O => {
    const parentScope = currentScope;
    currentScope = new Scope();

    try {
      var returnVal: O = fn(...args);
      if (returnVal === undefined) {
        // TODO(ericr): use a more specific error type
        throw new Error(
          "withScope expects a return value that is neither null or undefined"
        );
      }

      if (!returnVal.hasOwnProperty(privateProperty)) {
        (returnVal as any)[privateProperty] = [];
      }

      currentScope!.forEach((object: Object): void => {
        (returnVal as any)[privateProperty].push(object);
      });

      return returnVal;
    } finally {
      currentScope = parentScope;
    }
  });
};

export type CreateStateOptionalArgs = {
  autoScope?: boolean;
};

export const createState = <T>(
  value: T,
  args?: CreateStateOptionalArgs
): LeafAtom<T> => {
  const atom: LeafAtom<T> = new LeafAtomImpl(value);

  if (args?.autoScope ?? true) {
    currentScope.collect(atom);
  }

  return atom;
};

export type DeriveStateOptionalArgs = {
  autoScope?: boolean;
};

export const deriveState = <T>(
  deriveValue: Producer<T>,
  args?: DeriveStateOptionalArgs
): Atom<T> => {
  const atom: Atom<T> = new DerivedAtomImpl(deriveValue);

  if (args?.autoScope ?? true) {
    currentScope.collect(atom);
  }

  return atom;
};

export type RunEffectOptionalArgs = {
  autoScope?: boolean;
};

export const runEffect = (
  effect: Runnable,
  args?: RunEffectOptionalArgs
): SideEffectRef => {
  const atom: DerivedAtom<number> = deriveState<number>(
    () => {
      effect();
      return 0;
    },
    {
      autoScope: false,
    }
  );
  // we register a noop effect, which will cause the derived atom
  // to eagerly evaluate immediately after every dirty
  const sideEffectRef: SideEffectRef = atom.react(() => {});

  // // kick it to trigger the initial eager evaluation, which
  // // will in turn track any deps that the effect will run against
  atom.get();

  // since the DAG edges are all weak, there is nothing keeping this atom
  // alive. Hence, the caller is responsible for keeping it in scope by
  // keeping the ref in scope.
  //
  // This should probably be done through a registry but for now its fine
  (sideEffectRef as any).$$$recoilParentDerivedAtom = atom;

  if (args?.autoScope ?? true) {
    currentScope.collect(sideEffectRef);
  }

  return sideEffectRef;
};

export const state = (): void | any => {
  const registry: WeakMap<Object, LeafAtom<any>> = new WeakMap<
    Object,
    LeafAtom<any>
  >();

  return function (target: Object, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      set: function (this, newVal: any) {
        if (!registry.has(this)) {
          registry.set(
            this,
            createState(newVal, {
              autoScope: false,
            })
          );
        } else {
          registry.get(this)!.set(newVal);
        }
      },
      get: function (): any {
        return registry.get(this)!.get();
      },
    });
  };
};

export const derivedState = (): string | any => {
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): any => {
    const registry: WeakMap<Object, DerivedAtom<any>> = new WeakMap();
    const originalFn = descriptor.value;

    descriptor.value = function (...args: any[]): any {
      if (!registry.has(this)) {
        registry.set(
          this,
          deriveState(
            () => {
              return originalFn.apply(this, args);
            },
            {
              autoScope: false,
            }
          )
        );
      }
      return registry.get(this)!.get();
    };
  };
};
