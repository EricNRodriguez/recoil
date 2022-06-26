import {NodeBuilder} from "./node_builder.interface";

export const isNodeBuilder = (content: any): boolean => {
    return "build" in content;
}

export const unwrapNodesFromBuilder = <T>(content: T | NodeBuilder): T | Node => {
    if (isNodeBuilder(content)) {
        return (content as NodeBuilder).build();
    }

    return content as T;
}