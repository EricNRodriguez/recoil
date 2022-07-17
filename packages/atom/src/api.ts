import { LeafAtom, DerivedAtom, SideEffectRef } from "./atom.interface";
import { LeafAtomImpl, DerivedAtomImpl } from "./atom";
import { Atom } from "./atom.interface";
import {Consumer, notNullOrUndefined, Producer, Runnable} from "../../util";

export type ApiFunctionDecorator<F extends Function> = (fn: F) => F;

class ApiFunctionBuilder {
    private static instance: ApiFunctionBuilder = new ApiFunctionBuilder();

    private decoratorRegistry: Map<Function, ApiFunctionDecorator<any>[]> = new Map();

    public static getInstance(): ApiFunctionBuilder {
        return ApiFunctionBuilder.instance;
    }

    public registerDecorator<F extends Function>(apiFn: F, decorator: ApiFunctionDecorator<F>): void {
      if (!this.decoratorRegistry.has(apiFn)) {
        this.decoratorRegistry.set(apiFn, []);
      }

      this.decoratorRegistry.get(apiFn)!.push(decorator);
  }

  public deregisterDecorator<F extends Function>(apiFn: F, decorator: ApiFunctionDecorator<F>): void {
    this.decoratorRegistry.set(
        apiFn,
        (this.decoratorRegistry.get(apiFn) ?? []).filter(dec => dec !== decorator),
    );
  }

  public buildApiFunc<F extends Function>(publicApiFunc: F, baseFunc: F): F {
    return (this.decoratorRegistry.get(publicApiFunc) ?? [])
        .reduceRight((builtFunc: F, decorator: ApiFunctionDecorator<F>): F => decorator(builtFunc), baseFunc);
  }
}

export const registerDecorator = <F extends Function>(apiFn: F, decorator: ApiFunctionDecorator<F>): void => {
  return ApiFunctionBuilder.getInstance().registerDecorator(apiFn, decorator);
};

export const deregisterDecorator = <F extends Function>(apiFn: F, decorator: ApiFunctionDecorator<F>): void => {
  return ApiFunctionBuilder.getInstance().deregisterDecorator(apiFn, decorator);
};


// TODO(ericr): Support aborting
export const fetchState = <T>(
  producer: Producer<Promise<T>>,
): Atom<T | undefined> => {
  let reactionVersion: number = 0;
  let writeVersion: number = 0;
  const atom = createState<T | undefined>(undefined);

  const derivation = deriveState<Promise<T>>(producer);
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

export const createState = <T>(
  value: T,
): LeafAtom<T> => {
  const atom: LeafAtom<T> = new LeafAtomImpl(value);

  return atom;
};

export const deriveState = <T>(
  deriveValue: Producer<T>,
): Atom<T> => {
  const atom: Atom<T> = new DerivedAtomImpl(deriveValue);

  return atom;
};


export type RunEffectSignature = (effect: Runnable) => SideEffectRef;

let baseRunEffect = (
  effect: Runnable,
): SideEffectRef => {
  const atom: DerivedAtom<number> = deriveState<number>(
    () => {
      effect();
      return 0;
    },
  );
  // we register a noop effect, which will cause the derived atom
  // to eagerly evaluate immediately after every dirty
  const sideEffectRef: SideEffectRef = atom.react(() => {});

  // kick it to trigger the initial eager evaluation, which
  // will in turn track any deps that the effect will run against
  atom.get();

  // since the DAG edges are all weak, there is nothing keeping this atom
  // alive. Hence, the caller is responsible for keeping it in scope by
  // keeping the ref in scope.
  //
  // This should probably be done through a registry but for now its fine
  (sideEffectRef as any).$$$recoilParentDerivedAtom = atom;

  return sideEffectRef;
};

export const runEffect = (effect: Runnable): SideEffectRef => {
  return ApiFunctionBuilder.getInstance().buildApiFunc(runEffect, baseRunEffect)(effect);
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
            createState(newVal)
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
          )
        );
      }
      return registry.get(this)!.get();
    };
  };
};
