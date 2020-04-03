import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonPage,
  IonSplitPane,
  IonTitle,
  IonToolbar
} from "@ionic/react";
/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/typography.css";
import { useService } from "@xstate/react";
import { document } from "ionicons/icons";
import React from "react";
import { createMachine, forwardTo } from "xstate";
import { Pages } from "./pages/pages";
/* Theme variables */
import "./theme/variables.css";

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
        },
        on: {
          FILES: { actions: forwardTo("pages") },
          ISSUES: { actions: forwardTo("pages") }
        }
      }
    }
  });

export const App = ({ appRef }) => {
  const [current, send] = useService(appRef);

  return (
    <IonApp>
      <IonSplitPane contentId="main">
        <Menu send={send} />
        <IonPage id="main">
          <Pages pagesRef={current.children.pages} />
        </IonPage>
      </IonSplitPane>
    </IonApp>
  );
};

const Menu = ({ send }) => {
  return (
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Github Explorer</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonMenuToggle autoHide={false}>
            <IonItem
              routerDirection="none"
              onClick={() => {
                send({ type: "FILES" });
              }}
            >
              <IonIcon slot="start" icon={document} color="primary" />
              <IonLabel>Files</IonLabel>
            </IonItem>
            <IonItem
              routerDirection="none"
              onClick={() => {
                send({ type: "ISSUES" });
              }}
            >
              <IonIcon slot="start" icon={document} color="primary" />
              <IonLabel>Issues</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};
