import { IAtom } from "recoiljs-atom";
import {cleanup, createFragment, registerOnMountHook, registerOnUnmountHook, setChildren} from "recoiljs-dom";
import { Function } from "shared";
import { runRenderEffect } from "../binding/dom";

export type MatchProps<T> = {
  state: IAtom<T>;
  render: Function<T, Node>;
};

export const match = <T extends Object>(props: MatchProps<T>): Node => {
  let { state, render } = props;

  const anchor = createFragment([]);
  let prevState: T;
  let content: Node | null = null;
  const ref = runRenderEffect((): void => {
    if (prevState === state.get()) {
      return;
    }

    prevState = state.get();
    const prevContent = content;
    content = render(prevState);
    setChildren(anchor, [content]);
    if (prevContent !== null) {
      cleanup(prevContent);
    }
  });
  registerOnMountHook(anchor, () => ref.activate());
  registerOnUnmountHook(anchor, () => ref.deactivate());

  return anchor;
};
