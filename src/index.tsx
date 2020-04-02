import React from "react";
import ReactDOM from "react-dom";
import { interpret } from "xstate";
import { App, createAppMachine } from "./app";
import { config } from "./config";
import { createDirectoryMachine, createFilesMachine } from "./pages/files";
import { createIssuesMachine } from "./pages/issues";
import { createIssueDetailsMachine } from "./pages/issues/issue-details";
import { createPagesMachine } from "./pages/pages";
import * as serviceWorker from "./serviceWorker";
import { createBrowserHistory } from "history";

/**
 * Fetch
 *
 * Fetch function specialized to Github
 */
const _fetch = (path: string) => {
  return fetch(
    `${config.apiUrl}/repos/${config.owner}/${config.repository}/${path}`
  ).then(result => result.json());
};

const browserHistory = createBrowserHistory({});

const appMachine = createAppMachine({
  pagesMachine: createPagesMachine({
    history: browserHistory,
    filesMachine: createFilesMachine({
      directoryMachine: createDirectoryMachine({
        fetch: _fetch,
        folderPath: "/"
      })
    }),
    issuesMachine: createIssuesMachine({
      fetch: _fetch,
      issueDetailsMachine: createIssueDetailsMachine({ fetch: _fetch })
    })
  })
});

const appService = interpret(appMachine, { devTools: true }).start();

appService.subscribe(({ event }) => {
  console.log({ event });
});

ReactDOM.render(<App appRef={appService} />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
