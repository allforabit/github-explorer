import React from "react";
import { createMachine } from "xstate";
import { useService } from "@xstate/react";
import { Browser } from "./browser";
import { updateHistoryStates } from "xstate/lib/utils";
import { IonContent, IonPage } from "@ionic/react";

type NoData = {
  _type: "NO_DATA";
};

type Data<T> = {
  _type: "DATA";
  data: T;
};

type Loading<T> = {
  _type: "LOADING";
  data?: T;
};

type Error<E> = {
  _type: "ERROR";
  msg: E;
};

type AppState<T, E> = NoData | Data<T> | Loading<T> | Error<E>;

type R<T> = React.ComponentType<T>;

type View<T, E, P> = {
  NoData: R<P>;
  Data: R<{ data: T } & P>;
  Loading: R<P>;
  Error: R<{ msg: E } & P>;
};

type ExplicitViewsProps<T, E, P = {}> = {
  views: View<T, E, Omit<P, "views" | "state">>;
  state: AppState<T, E>;
} & P;

const ExplicitViews = <T, E, P>({
  state,
  views,
  ...props
}: ExplicitViewsProps<T, E, P>) => {
  const { NoData, Data, Loading, Error } = views;
  switch (state._type) {
    case "NO_DATA":
      return <NoData {...props} />;
    case "DATA":
      return <Data data={state.data} {...props} />;
    case "LOADING":
      return <Loading data={state.data} {...props} />;
    case "ERROR":
      return <Error msg={state.msg} {...props} />;
  }
};

// Example

type AppProps = { title: string };

const View = ({ title }: AppProps) => {
  return (
    <ExplicitViews<string, string, AppProps>
      title={title}
      state={{ _type: "NO_DATA" }}
      views={{
        NoData: ({ title }) => <div>{title}: We have no data.</div>,
        Data: ({ data }) => {
          return <div>We have some data: {data}</div>;
        },
        Loading: () => <div>Loading...</div>,
        Error: ({ msg }) => <div>We have an error: {msg}</div>
      }}
    />
  );
};

/**
 * Pages machine
 *
 * Manage pages (ie. views / screen)
 *
 * More or less a router state machine
 */
interface PagesContext {}

type PagesEvent = any;

type PagesState = {
  value: "files" | "issues";
  context: PagesContext;
};

export const createPagesMachine = ({ filesMachine, issuesMachine }) =>
  createMachine<PagesContext, PagesEvent, PagesState>({
    id: "pages",
    initial: "files",
    states: {
      files: {
        invoke: {
          id: "files",
          src: filesMachine
        }
      },
      issues: {
        invoke: {
          id: "issues",
          src: issuesMachine
        }
      }
    }
  });

export const Pages = ({ pagesRef }) => {
  const [current] = useService(pagesRef);

  switch (current.value) {
    case "files":
      return <Browser filesRef={current.children.files} />;
    case "issues":
      return (
        <IonPage>
          <IonContent>Issues</IonContent>
        </IonPage>
      );
  }
};
