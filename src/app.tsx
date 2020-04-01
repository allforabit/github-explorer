import * as React from "react";
import "./styles.css";
import { createMachine, assign, MachineConfig } from "xstate";
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
  IonLoading
} from "@ionic/react";

const createDirectoryMachine = ({
  fetch,
  folderPath
}: any): MachineConfig<any, any, any> =>
  createMachine({
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
          }
        }
      },
      focussedOnSub: {
        invoke: {
          id: "subFolder",
          src: ({ currentSubItem }) =>
            createDirectoryMachine({ fetch, folderPath: currentSubItem })
        }
      }
    }
  });

// const createAppMachine = ({ fetchFolders }) => {
//   return createMachine({
//     id: "app",
//     initial: "ready",
//     states: {
//       fetchingInitialFolder: {
//         invoke: {
//           src: createFolderMachine({ fetchFolders })
//         }
//       },
//       ready: {}
//     }
//   });
// };

export const App = ({ fetch }) => {
  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Github Explorer</IonTitle>
          </IonToolbar>
        </IonHeader>
        <FileBrowser fetch={fetch} />
      </IonPage>
    </IonApp>
  );
};

const FileBrowser = ({ fetch, folderPath = "/" }) => {
  const [current, send] = useMachine(
    createDirectoryMachine({ fetch, folderPath })
  );

  const { filesAndDirectories, currentSubItem } = current.context;

  if (current.matches("loading")) {
    return (
      <IonContent>
        <IonLoading isOpen message="Loading..." />
      </IonContent>
    );
  }

  // Recurse case
  if (current.matches("focussedOnSub")) {
    return <FileBrowser fetch={fetch} folderPath={currentSubItem} />;
  }

  return (
    <IonContent>
      <IonList>
        {filesAndDirectories.map(item => {
          return <File key={item.path} item={item} send={send} />;
        })}
      </IonList>
    </IonContent>
  );
};

const File = ({ item, send }) => {
  return (
    <IonItem
      key={item.path}
      onClick={() => {
        send({ type: "OPEN", path: item.path });
      }}
    >
      {item.name}
    </IonItem>
  );
};

const Directory = () => {
  return <div>A folder</div>;
};
