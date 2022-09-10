export declare type NonEmpty<T> = [T, ...T[]];
export declare type F<Args extends unknown[], ReturnType> = (...args: [...Args]) => ReturnType;
export declare type FDecorator<Args extends unknown[], ReturnType> = F<[F<Args, ReturnType>], F<Args, ReturnType>>;
//# sourceMappingURL=type.d.ts.map