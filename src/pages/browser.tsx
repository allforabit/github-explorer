import * as React from "react";
import { createMachine, assign, MachineConfig, StateMachine } from "xstate";
import { useMachine, useService } from "@xstate/react";
import {
  IonList,
  IonItem,
  IonApp,
  IonPage,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonLoading,
  IonIcon,
  IonButtons,
  IonButton,
  IonListHeader,
  IonLabel,
  IonSkeletonText,
  IonAvatar,
  IonThumbnail
} from "@ionic/react";
import {
  documentTextOutline,
  folderOutline,
  chevronBackOutline
} from "ionicons/icons";

interface BrowserContext {
  filesAndDirectories: any[];
  currentSubItem: string;
}

type BrowserEvent = { type: "OPEN"; path: string } | { type: "CLOSE" };

type BrowserState = {
  value: "loading" | "ready" | "focussedOnSub" | "closed";
  context: BrowserContext;
};

interface BrowserMachineParams {
  fetch: any;
  folderPath: string;
}

export const createDirectoryMachine = ({
  fetch,
  folderPath
}: BrowserMachineParams): StateMachine<
  BrowserContext,
  any,
  BrowserEvent,
  BrowserState
> =>
  createMachine<BrowserContext, BrowserEvent, BrowserState>({
    id: "folder",
    context: {
      filesAndDirectories: [],
      currentSubItem: ""
    },
    initial: "loading",
    states: {
      loading: {
        invoke: {
          id: "fetchFolders",
          src: () => fetch(`contents${folderPath}`),
          onDone: {
            target: "ready",
            actions: assign({
              filesAndDirectories: (_, { data }) => data
            })
          }
        }
      },
      ready: {
        on: {
          OPEN: {
            target: "focussedOnSub",
            actions: assign({ currentSubItem: (_, { path }) => path })
          },
          CLOSE: "closed"
        }
      },
      focussedOnSub: {
        invoke: {
          id: "subDir",
          src: ({ currentSubItem }) =>
            createDirectoryMachine({ fetch, folderPath: currentSubItem }),
          onDone: {
            target: "ready",
            actions: () => {
              console.log("Back...");
            }
          }
        }
      },
      closed: {
        type: "final"
      }
    }
  });

export const Browser = ({ fetch, machine }) => {
  const [_, __, service]: any = useMachine(machine);
  return (
    <IonApp>
      <FileBrowser fetch={fetch} browserRef={service} isRoot={true} />
    </IonApp>
  );
};

const FileBrowser = ({ browserRef, fetch, folderPath = "/", isRoot }: any) => {
  const [current, send]: any = useService(browserRef);

  const { filesAndDirectories, currentSubItem }: any = current.context;

  if (current.matches("loading")) {
    return <LoadingScreen />;
  }

  // Recurse case
  if (current.matches("focussedOnSub")) {
    return (
      <FileBrowser
        fetch={fetch}
        folderPath={currentSubItem}
        parentPath={folderPath}
        browserRef={current.children.subDir}
      />
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {isRoot ? null : (
            <IonButtons slot="start">
              <IonButton
                onClick={() => {
                  send("CLOSE");
                }}
              >
                <IonIcon icon={chevronBackOutline} />
              </IonButton>
            </IonButtons>
          )}
          <IonTitle>Viewing directory: TODO</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {filesAndDirectories.map(item => {
            return <FileBrowserItem key={item.path} item={item} send={send} />;
          })}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

const LoadingScreen = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Fetching content...</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen message="Loading" />
        <IonList>
          <IonListHeader>
            <IonLabel>
              <IonSkeletonText animated style={{ width: "20%" }} />
            </IonLabel>
          </IonListHeader>
          <IonItem>
            <IonAvatar slot="start">
              <IonSkeletonText animated />
            </IonAvatar>
            <IonLabel>
              <h3>
                <IonSkeletonText animated style={{ width: "50%" }} />
              </h3>
              <p>
                <IonSkeletonText animated style={{ width: "80%" }} />
              </p>
              <p>
                <IonSkeletonText animated style={{ width: "60%" }} />
              </p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonThumbnail slot="start">
              <IonSkeletonText animated />
            </IonThumbnail>
            <IonLabel>
              <h3>
                <IonSkeletonText animated style={{ width: "50%" }} />
              </h3>
              <p>
                <IonSkeletonText animated style={{ width: "80%" }} />
              </p>
              <p>
                <IonSkeletonText animated style={{ width: "60%" }} />
              </p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonSkeletonText
              animated
              style={{ width: "27px", height: "27px" }}
              slot="start"
            />
            <IonLabel>
              <h3>
                <IonSkeletonText animated style={{ width: "50%" }} />
              </h3>
              <p>
                <IonSkeletonText animated style={{ width: "80%" }} />
              </p>
              <p>
                <IonSkeletonText animated style={{ width: "60%" }} />
              </p>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

const FileBrowserItem = ({ item, send }: any) => {
  if (item.type === "dir") {
    return <FileBrowserItemDirectory item={item} send={send} />;
  }

  // Default to a file
  return <FileBrowserItemFile send={send} item={item} />;
};

const FileBrowserItemFile = ({ item, send }: any) => (
  <IonItem key={item.path}>
    <IonIcon icon={documentTextOutline} slot="start" />
    {item.name}
  </IonItem>
);

const FileBrowserItemDirectory = ({ item, send }: any) => (
  <IonItem
    key={item.path}
    onClick={() => {
      send({ type: "OPEN", path: item.path });
    }}
  >
    <IonIcon icon={folderOutline} slot="start" />
    {item.name}
  </IonItem>
);
