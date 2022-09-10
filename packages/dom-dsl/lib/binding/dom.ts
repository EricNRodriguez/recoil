import { WNode } from "recoiljs-dom";
import { IAtom, isAtom, ISideEffectRef, runEffect } from "recoiljs-atom";

type RawOrBinded<T> = IAtom<T> | T;
type Props = Record<string, RawOrBinded<any>>;

export const bindProps = (element: WNode<Node>, props: Props): void => {
  Object.entries(props).forEach(([key, val]) => {
    element.setProperty(key, val);
    if (isAtom(val)) {
      const ref: ISideEffectRef = runEffect(() =>
        element.setProperty(key, val.get())
      );
      element.registerOnMountHook(() => ref.activate());
      element.registerOnUnmountHook(() => ref.deactivate());
    } else {
      element.setProperty(key, val);
    }
  });
};
