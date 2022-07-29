import { WNode } from "../../dom";

type DefaultModuleType = {
  default: (...args: any[]) => WNode<Node>;
};

export const lazy = (
  getModule: () => Promise<DefaultModuleType>
): ((...args: any[]) => Promise<WNode<Node>>) => {
  const modulePromise = getModule();
  return async (...args: any[]): Promise<WNode<Node>> => {
    const module = await modulePromise;
    return module.default(...args);
  };
};
