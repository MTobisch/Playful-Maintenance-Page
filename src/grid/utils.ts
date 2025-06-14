export interface SumTrigger {
  add: (deltaTime: number) => void;
}

export function createSumTrigger(
  threshold: number,
  callback: (sum: number) => void
): SumTrigger {
  let currentSum = 0;

  return {
    add: (deltaTime: number) => {
      currentSum += deltaTime;
      if (currentSum >= threshold) {
        callback(currentSum);
        currentSum = 0;
      }
    },
  };
}
