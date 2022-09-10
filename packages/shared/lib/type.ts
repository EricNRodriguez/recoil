export type NonEmpty<T> = [T, ...T[]];
export type F<Args extends unknown[], ReturnType> = (...args: [...Args]) => ReturnType;
export type FDecorator<Args extends unknown[], ReturnType> = F<[F<Args, ReturnType>], F<Args, ReturnType>>;