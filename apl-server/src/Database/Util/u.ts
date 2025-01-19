export function u(...x:any[]) {
    return x.map(x => x ?? null);
}