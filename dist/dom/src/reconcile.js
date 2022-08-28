"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileNodeArrays = void 0;
const utils_1 = require("../../utils");
const frag = document.createDocumentFragment();
// heavily inspired by both
// https://github.com/ryansolid/dom-expressions/blob/07f693e7a60a487c07966c277f89a7c00c96c72b/packages/dom-expressions/src/reconcile.js
// and
// https://github.com/WebReflection/udomdiff/blob/8923d4fac63a40c72006a46eb0af7bfb5fdef282/index.js
const reconcileNodeArrays = ({ parent, currentNodes, newNodes, }) => {
    let curLeft = 0;
    let curRight = currentNodes.length;
    let newLeft = 0;
    let newRight = newNodes.length;
    let newNodesIndex = new Map(newNodes.map((node, idx) => [node, idx]));
    const appendRestOfNewNodes = () => {
        let nextNodeAnchor = null;
        if (newRight < newNodes.length) {
            if (newLeft > 0) {
                nextNodeAnchor = newNodes[newLeft - 1].nextSibling;
            }
            else {
                // when `currentNodes` is the common suffix
                nextNodeAnchor = newNodes[newRight];
            }
        }
        else {
            nextNodeAnchor = currentNodes[currentNodes.length - 1]?.nextSibling;
        }
        for (let i = newLeft; i < newRight; ++i) {
            frag.append(newNodes[i]);
        }
        newLeft = newRight;
        parent.insertBefore(frag, nextNodeAnchor);
    };
    const removeRestOfCurrentNodes = () => {
        currentNodes.slice(curLeft, curRight).forEach((node) => {
            node.remove();
            ++curLeft;
        });
    };
    const fallbackAndMapContiguousChunk = () => {
        if (newNodesIndex.has(currentNodes[curLeft])) {
            // We have a node that is in both `currentNodes` and `newNodes`, however has changed index
            const curStartIndexInNew = newNodesIndex.get(currentNodes[curLeft]);
            // SC
            if (curStartIndexInNew < newLeft || curStartIndexInNew >= newRight) {
                return;
            }
            // We find the largest common contiguous subsequence of nodes in `currentNodes` starting at curLeft,
            // that are also contiguous in `newNodes`, starting at `curIIndexInNew`
            let contigSubsequenceLen = 1;
            for (let i = curLeft + 1; i < curRight && i < newRight; ++i) {
                const curIIndexInNew = newNodesIndex.get(currentNodes[i]);
                if ((0, utils_1.nullOrUndefined)(curIIndexInNew) ||
                    curIIndexInNew - contigSubsequenceLen !== curStartIndexInNew) {
                    break;
                }
                contigSubsequenceLen++;
            }
            if (contigSubsequenceLen > curStartIndexInNew - newLeft) {
                const node = currentNodes[curLeft];
                while (newLeft < curStartIndexInNew) {
                    parent.insertBefore(newNodes[newLeft], node);
                    ++newLeft;
                }
            }
            else {
                parent.replaceChild(newNodes[newLeft], currentNodes[curLeft]);
                ++curLeft;
                ++newLeft;
            }
        }
        else {
            currentNodes[curLeft].remove();
            ++curLeft;
        }
    };
    const clipPrefix = () => {
        while (curLeft < curRight &&
            newLeft < newRight &&
            currentNodes[curLeft] === newNodes[newLeft]) {
            ++curLeft;
            ++newLeft;
        }
    };
    const clipSuffix = () => {
        while (curRight > curLeft &&
            newRight > newLeft &&
            currentNodes[curRight - 1] === newNodes[newRight - 1]) {
            --curRight;
            --newRight;
        }
    };
    while (curLeft < curRight || newLeft < newRight) {
        clipPrefix();
        clipSuffix();
        if (curLeft === curRight) {
            appendRestOfNewNodes();
        }
        else if (newLeft === newRight) {
            removeRestOfCurrentNodes();
        }
        else {
            fallbackAndMapContiguousChunk();
        }
    }
};
exports.reconcileNodeArrays = reconcileNodeArrays;
//# sourceMappingURL=reconcile.js.map