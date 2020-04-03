import React from "react";
import ReactDOM from "react-dom";
import { interpret, Interpreter } from "xstate";
import { App, createAppMachine } from "./app";
import { config } from "./config";
import { createDirectoryMachine, createFilesMachine } from "./pages/files";
import { createIssuesMachine } from "./pages/issues";
import { createIssueDetailsMachine } from "./pages/issues/issue-details";
import { createPagesMachine } from "./pages/pages";
import * as serviceWorker from "./serviceWorker";
import { createBrowserHistory } from "history";
import { from } from "rxjs";
import { mergeMap, filter, tap } from "rxjs/operators";
import { matchPath } from "react-router";

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
 * Routes config
 *
 * Derive state transitions from this
 */
const routes = {
  "/": { event: { type: "FILES" } },
  "/files": { event: { type: "FILES" } },
  "/issues": { event: { type: "ISSUES" } },
};

/**
 * Initial route event
 *
 * Figure out the initial route event to send to the pages machine based on the
 * pathname
 */
const initialRouteEvent =
  pathname === "/files" ? "FILES" : pathname === "/issues" ? "ISSUES" : null;

/**
 * Restored state
 *
 * Will be the state transitioned to by the `initialRouteEvent`, otherwise the
 * default machine initial state
 */
const restoredState = initialRouteEvent
  ? pagesMachine.transition(pagesMachine.initialState, {
      type: initialRouteEvent,
    })
  : pagesMachine.initialState;

/**
 * Pages machine restored
 *
 * Here we restore the state by providing an alternative initial state for the
 * machine
 */
const pagesMachineRestored = {
  ...pagesMachine,
  initialState: pagesMachine.resolveState(
    // Only use restored state if it's different (causes an error otherwise for
    // some reason)
    restoredState.value === pagesMachine.initialState.value
      ? pagesMachine.initialState
      : restoredState
  ),
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
const appService = interpret(appMachine, { devTools: true }).start();

appService.subscribe((current) => {
  console.group(current.event.type);
  console.log(current);
  console.groupEnd();
});

const pagesEvts = from(appService).pipe(
  // Make sure children.pages exists
  filter((current: any) => !!current.children.pages),
  mergeMap((current: any) => {
    return from(current.children.pages);
  })
);

// Process state changes
pagesEvts.subscribe(({ event }) => {
  if (event.type === "FILES") {
    browserHistory.push("/files");
  }
  if (event.type === "ISSUES") {
    browserHistory.push("/issues");
  }
});

ReactDOM.render(<App appRef={appService} />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
