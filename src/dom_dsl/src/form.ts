import {ElementBuilder} from "./builder/element_builder.interface";
import {ElementBuilderImpl} from "./builder/element_builder";
import {MaybeNodeOrNodeBuilder} from "./node.interface";
import {unwrapNodesFromBuilder} from "./builder/builder_util";

export enum FormTarget {
  BLANK= "_blank",
  SELF = "_self",
  PARENT = "_parent",
  TOP = "_top",
}


export const form = (...content: MaybeNodeOrNodeBuilder[]): ElementBuilder => {
  return new ElementBuilderImpl("form")
      .withChildren(...content.map(unwrapNodesFromBuilder<Node>));
};