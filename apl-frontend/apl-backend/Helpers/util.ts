export const addS = (value: number, text: string) => {
  return `${value} ${text}${value == 1 ? "" : "s"}`;
};

export function arithmeticWeightedMean(array: number[]): number {
  if (array.length === 0) return 0;

  const n = array.length;
  const s = (n * (n + 1)) / 2;
  return (
    array.reduce((a, b, i) => {
      return a + b * (n - i);
    }, 0) / s
  );
}
