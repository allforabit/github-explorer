import { useService } from "@xstate/react";
import React from "react";
import { createMachine } from "xstate";
import { Files } from "./files/files";
import { Issues } from "./issues";

/**
 * Pages machine
 *
 * Manage pages (ie. views / screen)
 *
 * More or less a router state machine
 */
interface PagesContext {}

type PagesEvent = { type: "ISSUES" } | { type: "FILES" };

type PagesState = {
  value: "routing" | "files" | "issues";
  context: PagesContext;
};

export const createPagesMachine = ({ history, filesMachine, issuesMachine }) =>
  createMachine<PagesContext, PagesEvent, PagesState>({
    id: "pages",
    initial: "routing",
    invoke: {
      src: () => cb => {
        const processRoute = pathname => {
          if (pathname === "/files") {
            cb({ type: "FILES" });
          }
          if (pathname === "/issues") {
            cb({ type: "ISSUES" });
          }
        };
        processRoute(history.location.pathname);
        return history.listen(({ pathname }) => {
          processRoute(pathname);
        });
      }
    },
    states: {
      routing: {
        on: {
          FILES: "files",
          ISSUES: "issues"
        }
      },
      files: {
        entry: [() => history.push("files")],
        on: {
          ISSUES: {
            target: "issues"
          }
        },
        invoke: {
          id: "files",
          src: filesMachine
        }
      },
      issues: {
        entry: [() => history.push("issues")],
        on: {
          FILES: "files"
        },
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
      return <Files filesRef={current.children.files} />;
    case "issues":
      return <Issues issuesRef={current.children.issues} />;
    case "routing":
      return null;
  }
};
