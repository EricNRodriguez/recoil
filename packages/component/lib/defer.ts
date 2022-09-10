import { WNode } from "recoiljs-dom";
import { Consumer, nonEmpty, Producer } from "shared";

const scope: Consumer<WNode<Node>>[][] = [];

export const defer = (fn: Consumer<WNode<Node>>): void => {
  if (!nonEmpty(scope)) {
    throw new Error("unable to defer functions outside of a scope");
  }

  scope[scope.length - 1].push(fn);
};

export const execute = <T extends WNode<Node>>(job: Producer<T>): T => {
  try {
    scope.push([]);
    const result: T = job();
    scope[scope.length - 1].forEach((fn: Consumer<T>) => fn(result));
    return result;
  } finally {
    scope.pop();
  }
};
