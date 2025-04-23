export declare const degrees: {
    test: (v: string | number) => boolean;
    parse: typeof parseFloat;
    transform: (v: number | string) => string;
};
export declare const percent: {
    test: (v: string | number) => boolean;
    parse: typeof parseFloat;
    transform: (v: number | string) => string;
};
export declare const px: {
    test: (v: string | number) => boolean;
    parse: typeof parseFloat;
    transform: (v: number | string) => string;
};
export declare const vh: {
    test: (v: string | number) => boolean;
    parse: typeof parseFloat;
    transform: (v: number | string) => string;
};
export declare const vw: {
    test: (v: string | number) => boolean;
    parse: typeof parseFloat;
    transform: (v: number | string) => string;
};
export declare const progressPercentage: {
    parse: (v: string) => number;
    transform: (v: number) => string;
    test: (v: string | number) => boolean;
};
