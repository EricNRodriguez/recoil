import {NodeBuilder} from "./node_builder.interface";

export const isNodeBuilder = (content: any): boolean => {
    return "build" in content;
}

export const unwrapNodesFromBuilder = <T>(content: T | NodeBuilder | null | undefined): T | Node | null | undefined => {
    if (content === null || content === undefined) {
        return content;
    }

    if (isNodeBuilder(content)) {
        return (content as NodeBuilder).build();
    }

    return content as T;
}