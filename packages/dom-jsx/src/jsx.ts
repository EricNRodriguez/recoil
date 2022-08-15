import {DomBuilder} from "../../component";
import {createElement, WNode} from "../../dom";
import {frag, t} from "../../dom-dsl";

export const Fragment = Symbol();

export const jsx = (tag: string | DomBuilder<Object, WNode<Node>> | Symbol, props: Object, children: WNode<Node>[]): WNode<Node> => {
    if (tag === Fragment) {
      return frag(...children);
    }

    if (typeof tag === "function") {
      // NOTE: how do we pass children through??? via the props?? or do we sort of encourage the component
      // api to take props and children as well??
      //
      // I think it may be worth exploring a component api that is closer to jsx. i.e. a ctx, then maybe props and
      // maybe props and children? I think this is an option worth exploring. We can do it with function overloading,
      // and it will make for a clean api that works well with jsx? this is also easier since we can pass more than the
      // specified number of args to a function in js and we wont get an error...
      return (tag as DomBuilder<Object, WNode<Node>>)(props);
    }

    if (typeof tag !== "string") {
      // TODO(ericr): more specific type and message
      throw new Error("tag type not supported");
    }

    return createElement(
      tag as any,
      props as any,
      [...children]
    );
};