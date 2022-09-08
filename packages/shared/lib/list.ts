export const firstNonEqualIndex = <T>(a: T[], b: T[]): number => {
  let firstNonEqualIndex: number = 0;
  while (
    firstNonEqualIndex < a.length &&
    firstNonEqualIndex < b.length &&
    a[firstNonEqualIndex] === b[firstNonEqualIndex]
  ) {
    ++firstNonEqualIndex;
  }

  return firstNonEqualIndex;
};
