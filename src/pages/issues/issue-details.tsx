import React from "react";
import { useService } from "@xstate/react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButtons,
  IonButton,
  IonIcon,
  IonLabel,
  IonAvatar,
  IonItemDivider,
  IonItemGroup
} from "@ionic/react";
import { createMachine, assign, AnyEventObject } from "xstate";
import { chevronBackOutline } from "ionicons/icons";
import { LoadingScreen } from "../../components/loading-screen";

interface IssueDetailsContext {
  id: "";
  title: "";
  comments: any[];
}

type IssueDetailsEvent = { type: "SELECT"; path: string } | { type: "CLOSE" };

type IssueDetailsState = {
  value: "loading" | "ready" | "closed";
  context: IssueDetailsContext;
};

interface IssuesMachineParams {
  fetch: any;
}

export const createIssueDetailsMachine = ({ fetch }) =>
  createMachine<IssueDetailsContext, IssueDetailsEvent, IssueDetailsState>({
    id: "issueDetails",
    initial: "loading",
    context: {
      id: "",
      title: "",
      comments: []
    },
    states: {
      loading: {
        invoke: {
          id: "load",
          src: ({ id }) => fetch(`issues/${id}/comments`),
          onDone: {
            target: "ready",
            actions: assign({
              comments: (_, { data }: AnyEventObject) => data
            })
          }
        }
      },
      ready: {
        on: {
          CLOSE: "closed"
        }
      },
      closed: {
        type: "final"
      }
    }
  });

export const IssueDetails = ({ issueDetailsRef }) => {
  const [current, send] = useService(issueDetailsRef);
  const { context, value }: any = current;
  const { comments, title } = context;

  if (value === "loading") {
    return <LoadingScreen />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              onClick={() => {
                send("CLOSE");
              }}
            >
              <IonIcon icon={chevronBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItemGroup>
          <IonItemDivider>
            <IonLabel>Comments</IonLabel>
          </IonItemDivider>
          {comments.map(comment => (
            <IssueComment key={comment.id} comment={comment} />
          ))}
        </IonItemGroup>
      </IonContent>
    </IonPage>
  );
};

const IssueComment = ({ comment }) => {
  console.log(comment, "comment");
  return (
    <IonItem>
      <IonAvatar slot="start">
        <img
          src={
            comment.user.avatar_url
              ? comment.user.avatar_url
              : "https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y"
          }
        />
      </IonAvatar>
      <IonLabel className="ion-text-wrap">{comment.body}</IonLabel>
    </IonItem>
  );
};
