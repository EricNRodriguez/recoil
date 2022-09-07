import { Supplier } from "./function.interface";

export const wrapStaticContentInProvider = <T>(
  content: T | Supplier<T>
): Supplier<T> => {
  if (typeof content === "function") {
    return content as Supplier<T>;
  } else {
    return (): T => content;
  }
};
