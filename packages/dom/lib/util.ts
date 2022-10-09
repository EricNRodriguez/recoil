import { createTextNode } from "./api";

export const wrapText = <T>(content: T | string): T | Node => {
  if (typeof content === "string") {
    return createTextNode(content);
  } else {
    return content;
  }
};
