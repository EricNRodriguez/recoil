import {
  firstNonEqualIndex,
  notNullOrUndefined,
  nullOrUndefined,
  removeNullAndUndefinedItems,
  Runnable,
} from "../../util";

export type ReconcileNodeArraysArgs = {
  parent: Node;
  currentNodes: Node[];
  newNodes: Node[];
};

// heavily inspired by both
// https://github.com/ryansolid/dom-expressions/blob/07f693e7a60a487c07966c277f89a7c00c96c72b/packages/dom-expressions/src/reconcile.js
// and
// https://github.com/WebReflection/udomdiff/blob/8923d4fac63a40c72006a46eb0af7bfb5fdef282/index.js
export const reconcileNodeArrays = ({
  parent,
  currentNodes,
  newNodes,
}: ReconcileNodeArraysArgs) => {
  let curLeft: number = 0;
  let curRight: number = currentNodes.length;

  let newLeft: number = 0;
  let newRight: number = newNodes.length;

  let newNodesIndex: Map<Node, number> = new Map(
    newNodes.map((node: Node, idx: number) => [node, idx])
  );

  const appendRestOfNewNodes = () => {
    let nextNodeAnchor: Node | null = null;
    if (newRight < newNodes.length) {
      if (newLeft > 0) {
        nextNodeAnchor = newNodes[newLeft - 1].nextSibling;
      } else {
        // when `currentNodes` is the common suffix
        nextNodeAnchor = newNodes[newRight];
      }
    } else {
      nextNodeAnchor = currentNodes[currentNodes.length - 1]?.nextSibling;
    }

    const frag = document.createDocumentFragment();
    frag.append(...newNodes.slice(newLeft, newRight));

    parent.insertBefore(frag, nextNodeAnchor);
  };

  const removeRestOfCurrentNodes = () => {
    currentNodes.slice(curLeft, curRight).forEach((node: Node): void => {
      (node as any).remove();
      ++curLeft;
    });
  };

  const fallbackAndMapContiguousChunk = () => {
    if (newNodesIndex.has(currentNodes[curLeft])) {
      // We have a node that is in both `currentNodes` and `newNodes`, however has changed index
      const curStartIndexInB = newNodesIndex.get(currentNodes[curLeft])!;

      // SC
      if (curStartIndexInB < newLeft || curStartIndexInB >= newRight) {
        return;
      }

      // We find the largest common contiguous subsequence of nodes in `currentNodes` starting at aStart,
      // that are also contiguous in `newNodes`, starting at `aStartIndexInB`
      let contigSubsequenceLen: number = 1;
      for (let i = curLeft + 1; i < curRight && i < newRight; ++i) {
        const curIIndexInB: number | undefined = newNodesIndex.get(
          currentNodes[i]
        );

        if (
          nullOrUndefined(curIIndexInB) ||
          curIIndexInB! - contigSubsequenceLen !== curStartIndexInB
        ) {
          break;
        }

        contigSubsequenceLen++;
      }

      if (contigSubsequenceLen > curStartIndexInB - newLeft) {
        const node: Node = currentNodes[curLeft];
        while (newLeft < curStartIndexInB) {
          parent.insertBefore(newNodes[newLeft], node);
          ++newLeft;
        }
      } else {
        parent.replaceChild(newNodes[newLeft], currentNodes[curLeft]);
        ++curLeft;
        ++newLeft;
      }
    } else {
      (currentNodes[curLeft] as any).remove();
      ++curLeft;
    }
  };

  while (curLeft < curRight || newLeft < newRight) {
    // clip prefix
    while (
      curLeft < curRight &&
      newLeft < newRight &&
      currentNodes[curLeft] === newNodes[newLeft]
    ) {
      ++curLeft;
      ++newLeft;
    }

    // clip suffix
    while (
      curRight > curLeft &&
      newRight > newLeft &&
      currentNodes[curRight - 1] === newNodes[newRight - 1]
    ) {
      --curRight;
      --newRight;
    }

    if (curLeft === curRight) {
      appendRestOfNewNodes();
    } else if (newLeft === newRight) {
      removeRestOfCurrentNodes();
    } else {
      fallbackAndMapContiguousChunk();
    }
  }
};
