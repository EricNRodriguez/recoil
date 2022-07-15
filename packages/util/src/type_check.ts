export const removeNullAndUndefinedItems = <T>(
  items: (T | null | undefined)[]
): T[] => {
  return items.filter(
    (item: T | null | undefined): boolean => item !== null && item !== undefined
  ) as T[];
};

export const nullOrUndefined = <T>(item: T): boolean => {
  return item === null || item === undefined;
};

export const notNullOrUndefined = <T>(item: T): boolean => {
  return !nullOrUndefined(item);
};
