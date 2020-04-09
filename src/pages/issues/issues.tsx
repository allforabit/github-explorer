import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useService } from "@xstate/react";
import * as React from "react";
import { assign, createMachine, StateMachine } from "xstate";
import { LoadingScreen } from "../../components/loading-screen";
import { IssueDetails } from "./issue-details";

interface IssuesContext {
  issues: any[];
  selected?: string;
}

type IssuesEvent = { type: "SELECT"; id: any };

type IssuesState = {
  value: "loading" | "ready" | "issueSelected";
  context: IssuesContext;
};

interface IssuesMachineParams {
  fetch: any;
  issueDetailsMachine: any;
}

export const createIssuesMachine = ({
  fetch,
  issueDetailsMachine,
}: IssuesMachineParams): StateMachine<
  IssuesContext,
  any,
  IssuesEvent,
  IssuesState
> =>
  createMachine<IssuesContext, IssuesEvent, IssuesState>({
    id: "issues",
    context: {
      issues: [],
      selected: "",
    },
    initial: "loading",
    states: {
      loading: {
        invoke: {
          id: "fetchIssues",
          src: () => fetch(`issues`),
          onDone: {
            target: "ready",
            actions: assign({
              issues: (_, { data }) => data,
            }),
          },
        },
        on: {
          SELECT: {
            actions: () => {
              console.log("Queue a select up after loading...");
            },
          },
        },
      },
      ready: {
        on: {
          SELECT: {
            target: "issueSelected",
            actions: assign({
              selected: (_, { id }: any) => id,
            }),
          },
        },
      },
      issueSelected: {
        invoke: {
          id: "issueDetails",
          src: issueDetailsMachine,
          data: {
            id: ({ selected }) => selected,
            title: ({ selected, issues }) =>
              issues
                .filter((issue) => issue.number === selected)
                .map((issue) => issue.title)[0],
          },
          onDone: {
            target: "ready",
            actions: assign({
              selected: (_) => "",
            }),
          },
        },
      },
    },
  });

export const Issues = ({ issuesRef }) => {
  console.log(issuesRef);

  React.useEffect(() => {
    issuesRef.send({ type: "HI" });
  }, []);

  return null;

  // const [current, send] = useService(issuesRef);

  // const { context, value } = current;
  // const { issues }: any = context;

  // switch (value) {
  //   case "loading":
  //     return <LoadingScreen />;
  //   case "ready":
  //     return (
  //       <Ready
  //         issues={issues}
  //         onClickIssue={(id: string) => send({ type: "SELECT", id } as any)}
  //       />
  //     );
  //   case "issueSelected":
  //     return <IssueDetails issueDetailsRef={current.children.issueDetails} />;
  // }
};

const Ready = ({ issues, onClickIssue }) => {
  // console.log(issues);
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {/* <IonButton>Menu</IonButton> */}
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Issues</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {issues.map((item) => {
            return (
              <IonItem key={item.id} onClick={() => onClickIssue(item.number)}>
                {item.title}
              </IonItem>
            );
          })}
        </IonList>
      </IonContent>
    </>
  );
};
