import {registerOnMountHook, registerOnUnmountHook, setProperty} from "recoiljs-dom";
import {EffectPriority, IAtom, isAtom, ISideEffectRef, runEffect} from "recoiljs-atom";
import {Runnable} from "shared";

type RawOrBinded<T> = IAtom<T> | T;
type Props = Record<string, RawOrBinded<any>>;

export const RenderEffectPriority: EffectPriority = EffectPriority.HIGH;

export const runRenderEffect = (effect: Runnable): ISideEffectRef => {
  return runEffect(effect, RenderEffectPriority);
}

export const bindProps = (element: Node, props: Props): void => {
  Object.entries(props).forEach(([key, val]) => {
    if (isAtom(val)) {
      const ref = runRenderEffect(() => {
        setProperty(element, key, val.get());
      });
      registerOnMountHook(element, () => ref.activate());
      registerOnUnmountHook(element, () => ref.deactivate());
    } else {
      setProperty(element, key, val);
    }
  });
};
