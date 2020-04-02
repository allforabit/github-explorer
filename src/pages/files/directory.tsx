import React from "react";
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
  IonThumbnail,
  IonMenuButton,
  IonCard
} from "@ionic/react";
import {
  documentTextOutline,
  folderOutline,
  chevronBackOutline
} from "ionicons/icons";
import { LoadingScreen } from "../../components/loading-screen";

interface DirectoryContext {
  filesAndDirectories: any[];
  currentSubItem: string;
  path: "";
}

type DirectoryEvent = { type: "OPEN"; path: string } | { type: "CLOSE" };

type DirectoryState = {
  value: "loading" | "ready" | "focussedOnSub" | "closed";
  context: DirectoryContext;
};

interface DirectoryMachineParams {
  fetch: any;
  folderPath: string;
}

export const createDirectoryMachine = ({
  fetch,
  folderPath
}: DirectoryMachineParams): StateMachine<
  DirectoryContext,
  any,
  DirectoryEvent,
  DirectoryState
> =>
  createMachine<DirectoryContext, DirectoryEvent, DirectoryState>({
    id: "folder",
    context: {
      filesAndDirectories: [],
      currentSubItem: "",
      path: ""
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
            target: "ready"
          },
          data: {
            path: ({ currentSubItem }) => currentSubItem
          }
        }
      },
      closed: {
        type: "final"
      }
    }
  });

export const Directory = ({ directoryRef, isRoot }: any) => {
  const [current, send]: any = useService(directoryRef);

  const { filesAndDirectories, currentSubItem, path }: any = current.context;

  if (current.matches("loading")) {
    return <LoadingScreen />;
  }

  // Recurse case
  if (current.matches("focussedOnSub")) {
    return (
      <Directory
        folderPath={currentSubItem}
        directoryRef={current.children.subDir}
      />
    );
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {isRoot ? (
              <IonMenuButton />
            ) : (
              <IonButton
                onClick={() => {
                  send("CLOSE");
                }}
              >
                <IonIcon icon={chevronBackOutline} />
              </IonButton>
            )}
          </IonButtons>
          <IonTitle size="small" color="secondary">
            {isRoot ? "/" : path}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {filesAndDirectories.map(item => {
            return <DirectoryItem key={item.path} item={item} send={send} />;
          })}
        </IonList>
      </IonContent>
    </>
  );
};

const DirectoryItem = ({ item, send }: any) => {
  // TODO cater for more file types
  if (item.type === "dir") {
    return <DirectoryItemDirectory item={item} send={send} />;
  }

  // Default to a file
  return <DirectoryItemFile send={send} item={item} />;
};

const DirectoryItemFile = ({ item, send }: any) => (
  <IonItem key={item.path}>
    <IonIcon icon={documentTextOutline} slot="start" />
    {item.name}
  </IonItem>
);

const DirectoryItemDirectory = ({ item, send }: any) => (
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
