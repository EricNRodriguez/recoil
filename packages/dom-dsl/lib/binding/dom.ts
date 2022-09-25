import { WNode } from "recoiljs-dom";
import {EffectPriority, IAtom, isAtom, ISideEffectRef, runEffect} from "recoiljs-atom";
import {Runnable} from "shared";

type RawOrBinded<T> = IAtom<T> | T;
type Props = Record<string, RawOrBinded<any>>;

export const RenderEffectPriority: EffectPriority = EffectPriority.HIGH;

export const runRenderEffect = (effect: Runnable): ISideEffectRef => {
  return runEffect(effect, RenderEffectPriority);
}

export const bindProps = (element: WNode<Node>, props: Props): void => {
  Object.entries(props).forEach(([key, val]) => {
    element.setProperty(key, val);
    if (isAtom(val)) {
      const ref: ISideEffectRef = runRenderEffect(() =>
        element.setProperty(key, val.get()),
      );
      element.registerOnMountHook(() => ref.activate());
      element.registerOnUnmountHook(() => ref.deactivate());
    } else {
      element.setProperty(key, val);
    }
  });
};
