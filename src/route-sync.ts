import { createMachine, interpret, StateNode, State } from "xstate";
import { from, of, merge, Observable } from "rxjs";
import { expand, map, distinctUntilChanged, filter } from "rxjs/operators";
import { isActor } from "xstate/lib/utils";

/**
 * Route sync
 *
 * Derive a route suitable to send to the browser history
 */

// TODO doesn't seem to skip "generations" correctly

export const routeSync = (service, config) => {
  const obs: Observable<any> = from(service);

  return obs.pipe(
    map((val) => [val, []]),
    // Recursively process children of root service
    expand((current) => {
      const [val, path] = current;
      return merge(
        ...Object.keys(val.children)
          .filter((k) => !!config[k])
          .filter((k) => isActor(val.children[k]))
          .map((k) =>
            from(val.children[k]).pipe(
              // Wrap actual value to add some metadata
              map((current) => {
                // TODO use concat
                return [current, [...path, config[k](current)]];
              })
            )
          )
      );
    }),
    // Leaf only
    // TODO will probabrly need to more specific
    filter(([current]: any) => {
      return Object.keys(current.children).length === 0;
    }),
    map(([, routeData]) => routeData),
    distinctUntilChanged()
  );
};
