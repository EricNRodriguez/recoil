import {reconcileNodeArrays} from "./reconcile";
import {Method, Runnable} from "shared";
import {wrapText} from "./util";
import {GlobalEventCoordinator} from "./event";

/**
 * An override to the information stored in the DOM
 *
 * Intended to be used for portal/fragment implementations, where the logical tree differs
 * from the reified tree seen in the dom.
 *
 * When a MetaNode exists for any node in the dom, it will be treated as the source of truth over the
 * dom object itself, where relevant. The decision to only register MetaNodes where necessary was driven by performance
 * profiling, not maintainability of any kind.
 */
class MetaNode {
  vParent: Node | null = null;
  vChildren: Node[] = [];

  constructor(parent: Node | null, vChildren: Node[]) {
    this.vParent = parent;
    this.vChildren = vChildren;
  }
}

const metaNodeRegistry = new WeakMap<Node, MetaNode>();

/**
 * A lazily instantiated registry for lifecycle hooks, registered against a dom node.
 */
class HookRegistry {
  readonly onMount: Runnable[] = [];
  readonly onUnmount: Runnable[] = [];
  readonly onCleanup: Runnable[] = [];
}

const nodeHookRegistryStore = new WeakMap<Node, HookRegistry>();


const RECOIL_FRAG_NODE_TAG = "RECOIL-FRAGMENT";
export const createFragment = (children: Node[]): Node => {
  const frag = document.createElement(RECOIL_FRAG_NODE_TAG); // HTMLInvalidElement
  setChildren(frag, children);
  metaNodeRegistry.set(frag, new MetaNode(null, children));

  return frag;
};

const isFrag = (node: Node): boolean => {
  return node.nodeName === RECOIL_FRAG_NODE_TAG;
}

const getHookRegistry = (node: Node, createIfDoesntExist: boolean): HookRegistry | null => {
    let registry = nodeHookRegistryStore.get(node) ?? null;

    if (createIfDoesntExist && registry == null) {
      registry = new HookRegistry();
      nodeHookRegistryStore.set(node, registry);
    }

    return registry;
};

export const unmount = (node: Node): void => {
  getChildren(node)
    .forEach(unmount);

  getHookRegistry(node, false)
    ?.onUnmount
    .forEach((h) => h());
};

export const registerOnUnmountHook = (node: Node, hook: Runnable): void => {
  getHookRegistry(node, true)?.onUnmount.push(hook);
};

export const mount = (node: Node): void => {
  getChildren(node)
    .forEach(mount);

  getHookRegistry(node, false)
    ?.onMount
    .forEach((h) => h());
};

export const registerOnMountHook = (node: Node, hook: Runnable): void => {
  getHookRegistry(node, true)!.onMount.push(hook);
};

export const cleanup = (node: Node): void => {
  getChildren(node)
    .forEach(cleanup);

  getHookRegistry(node, false)
    ?.onCleanup
    .forEach((h) => h());
};

export const registerOnCleanupHook = (node: Node, hook: Runnable): void => {
  getHookRegistry(node, true)?.onCleanup.push(hook);
};

export const isMounted = (node: Node): boolean => {
    if (metaNodeRegistry.has(node) && metaNodeRegistry.get(node)!.vParent != null) {
      return isMounted(metaNodeRegistry.get(node)!.vParent!);
    }

    return node.isConnected;
};

const getChildren = (node: Node): Node[] => {
  return metaNodeRegistry.get(node)?.vChildren ?? Array.from(node.childNodes);
};


export const setProperty = (node: Node, key: string, val: any): void => {
    if (!(key in node)) {
      console.log(`unable to set property that doesnt exist, ${key} on ${node}`);
    }

    (node as any)[key] = val;
};

const globalEventCoordinator = new GlobalEventCoordinator();

export const registerEventHandler = <K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: Method<HTMLElement, HTMLElementEventMap[K], void>,
): void => {
  globalEventCoordinator.attachEventHandler(type, element, listener);
};

export const deregisterDelegatedEventHandler = <K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: Method<HTMLElement, HTMLElementEventMap[K], void>
): void => {
  globalEventCoordinator.attachEventHandler(type, element, listener);
};

export const setChildren = (parent: Node, children: (Node | string)[]): void => {
  let newChildren = children.map(wrapText);
  newChildren = Array.from(newChildren);
  const currentChildren = Array.from(getChildren(parent));

  // we need to capture the state before any mutations are made below.
  const mountedNewChildren = newChildren.filter(isMounted);
  const unmountedNewChildren = newChildren.filter((nc) => !isMounted(nc));
  const currentChildrenToUnmount: Node[] = [];

  if (isMounted(parent)) {
    for (let currentChild of currentChildren) {
      if (!newChildren.includes(currentChild)) {
        const currentChildMeta = metaNodeRegistry.get(currentChild);
        if (currentChildMeta !== undefined) {
          currentChildMeta.vParent = null;
        }
        currentChildrenToUnmount.push(currentChild);
      }
    }
  }

  let anyChildrenAreFrags = false;
  for (let newChild of newChildren) {
    anyChildrenAreFrags ||= isFrag(newChild);
    const newChildMeta = metaNodeRegistry.get(newChild);
    if (newChildMeta !== undefined) {
      newChildMeta.vParent = parent;
    }
  }

  const isParentMounted = isMounted(parent);
  const syncMountStatusOfNewChildren = () => {
    isParentMounted ?
      unmountedNewChildren.forEach(mount) :
      mountedNewChildren.forEach(unmount);
  };
  const syncMountStatusOfRemovedChildren = () => {
    if (isParentMounted) {
      currentChildrenToUnmount.forEach(unmount);
    }
  };

  let parentMeta = metaNodeRegistry.get(parent);

  if (parentMeta !== undefined) {
    parentMeta.vChildren.length = 0;
    for (let newChild of newChildren) {
      parentMeta.vChildren.push(newChild);
    }

  }

  if (parentMeta === undefined && anyChildrenAreFrags) {
    metaNodeRegistry.set(parent, new MetaNode(null, newChildren));
    parentMeta = metaNodeRegistry.get(parent);
  }

  if (isFrag(parent)) {
    if (parentMeta?.vParent != null) {
      setChildren(
        parentMeta.vParent,
        getChildren(parentMeta.vParent),
      );
    }
    syncMountStatusOfRemovedChildren();
    syncMountStatusOfNewChildren();
    return;
  }

  reconcileNodeArrays({
    parent: parent,
    currentNodes: Array.from(parent.childNodes),
    newNodes: flatten(newChildren),
  });

  syncMountStatusOfRemovedChildren();
  syncMountStatusOfNewChildren();
  return;
};

const flatten = (nodes: Node[]): Node[] => {
  const unpackedChildren: Node[] = [];

  for (let child of nodes) {
    if (isFrag(child)) {
      for (let subChild of flatten(getChildren(child))) {
        unpackedChildren.push(subChild);
      }
    } else {
      unpackedChildren.push(child);
    }
  }

  return unpackedChildren;
};

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props,
  children: Node[],
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);

  setChildren(node, children);

  Object.entries(props).forEach(([key, val]) => {
    (node as any)[key] = val;
  });

  return node;
};

export const createTextNode = (text: string): Text => {
  const node = document.createTextNode(text);
  node.textContent = text;
  return node;
};


export const runApp = (anchor: HTMLElement, app: Node): void => {
  setChildren(
    anchor,
    [app]
  );
};

export type Props = Record<string, any>;
export type Children = Node[];
