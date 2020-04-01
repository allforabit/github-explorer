import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, IonContent, IonPage } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

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

/* Theme variables */
import "./theme/variables.css";
import { Browser } from "./pages/browser";
import { createMachine } from "xstate";
import { createPagesMachine, Pages } from "./pages/pages";
import { useService, useMachine } from "@xstate/react";

interface AppContext {}

type AppEvent = any;

type AppState = {
  value: "contents" | "issues";
  context: AppContext;
};

// The root machine
export const createAppMachine = ({ pagesMachine }) =>
  createMachine<AppContext, AppEvent, AppState>({
    id: "app",
    initial: "ready",
    states: {
      ready: {
        invoke: {
          id: "pages",
          src: pagesMachine
        }
      }
    }
  });

export const App = ({ appMachine }) => {
  const [current] = useMachine(appMachine);
  return (
    <IonApp>
      <Pages pagesRef={current.children.pages} />
    </IonApp>
  );
};
