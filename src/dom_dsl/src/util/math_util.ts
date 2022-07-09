
export type ClampArgs = {
    max?: number,
    min?: number,
    val: number,
};

export const clamp = (args: ClampArgs): number => {
    return Math.max(
        args.max ?? Number.NEGATIVE_INFINITY,
        Math.min(
            args.min ?? Number.POSITIVE_INFINITY,
            args.val,

        )
    );
};