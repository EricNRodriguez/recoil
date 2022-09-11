export type DefaultModuleType<T> = {
  default: (...args: any[]) => T;
};

export const lazy = <T>(
  getModule: () => Promise<DefaultModuleType<T>>
): ((...args: any[]) => Promise<T>) => {
  return async (...args: any[]): Promise<T> => {
    const module = await getModule();
    return module.default(...args);
  };
};
