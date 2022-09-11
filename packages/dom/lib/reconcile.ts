import { nullOrUndefined } from "shared";

export type ReconcileNodeArraysArgs = {
  parent: Node;
  currentNodes: Node[];
  newNodes: Node[];
};

const frag: DocumentFragment = document.createDocumentFragment();

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

    for (let i = newLeft; i < newRight; ++i) {
      frag.append(newNodes[i]);
    }
    newLeft = newRight;

    parent.insertBefore(frag, nextNodeAnchor);
  };

  const removeRemainingUnmappedCurrentNodes = () => {
    currentNodes.slice(curLeft, curRight).forEach((node: Node): void => {
      // only drop remaining cur nodes that were never mapped.
      if (!newNodesIndex.get(currentNodes[curLeft])) {
        (node as any).remove();
      }
      ++curLeft;
    });
  };

  const fallbackAndMapContiguousChunk = () => {
    if (newNodesIndex.has(currentNodes[curLeft])) {
      // We have a node that is in both `currentNodes` and `newNodes`, however has changed index
      const curStartIndexInNew = newNodesIndex.get(currentNodes[curLeft])!;

      if (newLeft >= curStartIndexInNew || curStartIndexInNew >= newRight) {
        curLeft++;
        return;
      }

      // We find the largest common contiguous subsequence of nodes in `currentNodes` starting at curLeft,
      // that are also contiguous in `newNodes`, starting at `curIIndexInNew`
      let contigSubsequenceLen: number = 1;
      for (let i = curLeft + 1; i < curRight && i < newRight; ++i) {
        const curIIndexInNew: number | undefined = newNodesIndex.get(
          currentNodes[i]
        );

        if (
          nullOrUndefined(curIIndexInNew) ||
          curIIndexInNew! - contigSubsequenceLen !== curStartIndexInNew
        ) {
          break;
        }

        contigSubsequenceLen++;
      }

      if (contigSubsequenceLen > curStartIndexInNew - newLeft) {
        // the subsequence is longer than the missing prefix, so we just append the prefix,
        // with the following outer loop clipping the suffix, which results in fewer ops
        const node: Node = currentNodes[curLeft];
        while (newLeft < curStartIndexInNew) {
          parent.insertBefore(newNodes[newLeft], node);
          ++newLeft;
        }
      } else {
        parent.replaceChild(newNodes[newLeft], currentNodes[curLeft]); // newchild, oldchild
        ++curLeft;
        ++newLeft;
      }

    } else {
      (currentNodes[curLeft] as any).remove();
      ++curLeft;
    }
  };

  const clipPrefix = (): void => {
    while (
      curLeft < curRight &&
      newLeft < newRight &&
      currentNodes[curLeft] === newNodes[newLeft]
      ) {
      ++curLeft;
      ++newLeft;
    }
  };

  const clipSuffix = (): void => {
    while (
      curRight > curLeft &&
      newRight > newLeft &&
      currentNodes[curRight - 1] === newNodes[newRight - 1]
      ) {
      --curRight;
      --newRight;
    }
  };

  while (curLeft < curRight || newLeft < newRight) {
    clipPrefix();
    clipSuffix();

    if (curLeft === curRight) {
      appendRestOfNewNodes();
    } else if (newLeft === newRight) {
      removeRemainingUnmappedCurrentNodes();
    } else {
      fallbackAndMapContiguousChunk();
    }
  }
};