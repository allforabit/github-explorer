import * as React from "react";
import { render } from "react-dom";
import { App } from "./app";
import { config, Config } from "./config";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

const rootElement = document.getElementById("root");

const createFetch = (config: Config) => (path: string) => {
  return fetch(
    `${config.apiUrl}/repos/${config.owner}/${config.repository}/${path}`
  ).then(result => result.json());
};

// const fetchFolders = () => fetch(`${config.apiUrl}/repos/${config.owner}/${config.repository}/contents`)
//   .then(result => result.json())

render(<App fetch={createFetch(config)} />, rootElement);
