import { WNode } from "recoiljs-dom";

type DefaultModuleType = {
  default: (...args: any[]) => WNode<Node>;
};

export const lazy = (
  getModule: () => Promise<DefaultModuleType>
): ((...args: any[]) => Promise<WNode<Node>>) => {
  return async (...args: any[]): Promise<WNode<Node>> => {
    const module = await getModule();
    return module.default(...args);
  };
};
