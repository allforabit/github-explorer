import { IonApp } from "@ionic/react";
import { useService } from "@xstate/react";
import * as React from "react";
import { createMachine } from "xstate";
import { Directory } from "./directory";

export const createFilesMachine = ({ directoryMachine }) =>
  createMachine({
    id: "files",
    initial: "ready",
    states: {
      ready: {
        invoke: {
          id: "rootDirectory",
          src: directoryMachine
        }
      }
    }
  });

export const Files = ({ filesRef }) => {
  const [current] = useService(filesRef);
  return (
    <IonApp>
      <Directory directoryRef={current.children.rootDirectory} isRoot />
    </IonApp>
  );
};
