// Might not be the most efficient way for large data sets,
// but should do the job for our case
export const median = (values: number[]) => {
  if (!values.length) return undefined;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2) return sorted[middle];

  return (sorted[middle - 1] + sorted[middle]) / 2.0;
};

export const average = (arr: number[]) =>
  arr.reduce((p, c) => p + c, 0) / arr.length;
