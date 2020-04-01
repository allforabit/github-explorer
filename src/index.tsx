import React from "react";
import ReactDOM from "react-dom";
import { App, createAppMachine } from "./app";
import * as serviceWorker from "./serviceWorker";
import { config, Config } from "./config";
import { createDirectoryMachine } from "./pages/browser";
import { createPagesMachine } from "./pages/pages";

const createFetch = (config: Config) => (path: string) => {
  return fetch(
    `${config.apiUrl}/repos/${config.owner}/${config.repository}/${path}`
  ).then(result => result.json());
};

const directoryMachine = createDirectoryMachine({
  fetch: createFetch(config),
  folderPath: "/"
});

const appMachine = createAppMachine({
  pagesMachine: createPagesMachine({
    filesMachine: createDirectoryMachine({
      fetch: createFetch(config),
      folderPath: "/"
    }),
    issuesMachine: Promise.resolve("Hi")
  })
});

ReactDOM.render(
  <App appMachine={appMachine} />,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
