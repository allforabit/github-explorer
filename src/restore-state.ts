export const restoreState = () => {};

/**
 * Restore state deep
 *
 * Restore a machine and it's child services
 *
 * The returned machine should be prepped so that when it is interpretted it
 * boots into it's previous state
 */
export const restoreStateDeep = (machine, state) => {
  return machine;
};
