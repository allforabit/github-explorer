/**
 * Experimetn with rstream custom interpretor
 */

import { subscription, stream } from "@thi.ng/rstream";
import { scan, reducer } from "@thi.ng/transducers";

// Would need to recursively spawn interpretors as it produces new children
// (Something like rx expand)
export const interpret = (machine) => {
  return subscription(null, {
    xform: scan(
      reducer(
        () => machine.initialState,
        (state, event) => machine.transition(state, event)
      )
    ),
  });
};
