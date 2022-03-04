export const waitFor = (
  conditionFunction: () => unknown,
  seconds: number
): Promise<void> => {
  const timeofStart = Date.now();

  const poll = (resolve: (value: void | PromiseLike<void>) => unknown) => {
    if (conditionFunction() || Date.now() - timeofStart > seconds * 1000) {
      resolve();
    } else {
      setTimeout(() => poll(resolve), 100);
    }
  };

  return new Promise(poll);
};
