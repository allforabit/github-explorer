import React from "react";
import ReactDOM from "react-dom";
import { interpret, Interpreter, State } from "xstate";
import { App, createAppMachine } from "./app";
import { config } from "./config";
import { createDirectoryMachine, createFilesMachine } from "./pages/files";
import { createIssuesMachine } from "./pages/issues";
import { createIssueDetailsMachine } from "./pages/issues/issue-details";
import { createPagesMachine } from "./pages/pages";
import * as serviceWorker from "./serviceWorker";
import { createBrowserHistory } from "history";
import { from, of } from "rxjs";
import {
  mergeMap,
  filter,
  tap,
  expand,
  combineLatest,
  distinctUntilChanged,
  debounceTime,
} from "rxjs/operators";
import { matchPath } from "react-router";
import { routeSync } from "./route-sync";
import restore from "./manual.json";

console.log({ restore });

/**
 * Fetch
 *
 * Fetch function specialized to Github
 */
const _fetch = (path: string) => {
  return fetch(
    `${config.apiUrl}/repos/${config.owner}/${config.repository}/${path}`
  ).then((result) => result.json());
};

const browserHistory = createBrowserHistory({});

const pagesMachine = createPagesMachine({
  history: browserHistory,
  // Will need to restore the directory machine based on route
  filesMachine: createFilesMachine({
    directoryMachine: createDirectoryMachine({
      fetch: _fetch,
      folderPath: "/",
    }),
  }),
  issuesMachine: createIssuesMachine({
    fetch: _fetch,
    issueDetailsMachine: createIssueDetailsMachine({ fetch: _fetch }),
  }),
});

const {
  location: { pathname },
} = browserHistory;

// Example url:
// http://localhost:3000/files/scripts/babel
// matcher = `/files/:currentSubItem/:currentSubItem`
// Result should select the item indicated in each path part (currentSubItem)

/**
 * Initial route event
 *
 * Figure out the initial route event to send to the pages machine based on the
 * pathname
 */
// TODO restoring to issues gives an error in routeSync
// For some reason a bare object is being created instead of a proper service
const initialRouteEvent =
  pathname === "/files" ? "FILES" : pathname === "/issues" ? "ISSUES" : null;

/**
 * Restored state
 *
 * Will be the state transitioned to by the `initialRouteEvent`, otherwise the
 * default machine initial state
 */
// const restoredState = initialRouteEvent
//   ? pagesMachine.transition(pagesMachine.initialState, {
//       type: "ISSUES",
//     })
//   : pagesMachine.initialState;

const {
  configuration,
  transitions,
  children,
  ...restoredState
} = pagesMachine.transition(pagesMachine.initialState, {
  type: "ISSUES",
});

// Retrieving the state definition from localStorage
// const stateDefinition = JSON.parse(localStorage.getItem("pages-state"));
const stateDefinition = restore;

// Use State.create() to restore state from a plain object
const previousState = State.create(stateDefinition as any);

// Use machine.resolveState() to resolve the state definition to a new State instance relative to the machine
const resolvedState = pagesMachine.resolveState(previousState as any);

/**
 * Pages machine restored
 *
 * Here we restore the state by providing an alternative initial state for the
 * machine
 */

const pagesMachineRestored = {
  ...pagesMachine,
  initialState: resolvedState,
};

/**
 * App machine
 *
 * Root machine for the app
 */
const appMachine = createAppMachine({
  pagesMachine: pagesMachineRestored,
});

/**
 * App service
 *
 * Running service that will contain all app functionality
 */
// TODO restoration will have to happen here for now (via root service)
// I.e. basic root information will need to propogate upward to root machine
const appService = interpret(appMachine, { devTools: true }).start();

appService.subscribe((current) => {
  console.group(current.event.type);
  console.log(current);
  console.groupEnd();
});

/**
 * Routes config
 *
 * Derive state transitions from this
 */
// TODO monitor pop_state for incoming changes

const unlisten = browserHistory.listen((v, type) => {
  if (type === "POP") {
    console.log(v);
  }
});

// TODO restore initial router state

// const routes_ = {
//   "/": { event: { type: "FILES" } },
//   "/files": { event: { type: "FILES" } },
//   "/issues": { event: { type: "ISSUES" } },
// };

// // Per machine config by id
// const routes = {
//   pages: (current) => current.value,
//   issues: (current) => current.context.selected,
//   files: (current) => current.value,
//   // Don't seem to be working
//   rootDirectory: (current) => current.context.currentSubItem,
//   subDir: (current) => current.context.currentSubItem,
// };

// const appEvents = from(appService);

// const pagesEvents = appEvents.pipe(
//   mergeMap((current: any) => from(current.children.pages))
// );

// pagesEvents.subscribe((current) => {
//   const jsonState = JSON.stringify(current);

//   // Example: persisting to localStorage
//   try {
//     localStorage.setItem("pages-state", jsonState);
//   } catch (e) {
//     // unable to save to localStorage
//   }
// });

// const routeUpdates = routeSync(appEvents, routes);

// // TODO fix it so in between route events don't occur
// // Temp buffer unneeded route changes
// routeUpdates.subscribe((path: string[]) => {
//   // browserHistory.push(`/${path.join("/")}`, path.join(" "));
// });

// appEvents.subscribe((current) => {
//   const obs = Object.values(current.children).map((service) =>
//     from(service as any)
//   );
// });

// const routeEvents = appEvents.pipe(
//   mergeMap((current) => {
//     const obs = Object.values(current.children).map((service) =>
//       from(service as any)
//     );
//     console.log({ obs });
//     return combineLatest(...obs);
//     // return of(999);
//   })
// );

// routeEvents.subscribe((services) => {
//   console.log({ services });
// });

// // Process state changes
// pagesEvts.subscribe(({ event }) => {
//   if (event.type === "FILES") {
//     browserHistory.push("/files");
//   }
//   if (event.type === "ISSUES") {
//     browserHistory.push("/issues");
//   }
// });

ReactDOM.render(<App appRef={appService} />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
