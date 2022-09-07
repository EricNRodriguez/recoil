export type ClampArgs = {
  max?: number;
  min?: number;
  val: number;
};

export const clamp = (args: ClampArgs): number => {
  return Math.max(
    args.min ?? Number.NEGATIVE_INFINITY,
    Math.min(args.max ?? Number.POSITIVE_INFINITY, args.val)
  );
};
