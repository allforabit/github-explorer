import { useService } from "@xstate/react";
import React from "react";
import { createMachine, send, forwardTo } from "xstate";
import { Files } from "./files/files";
import { Issues } from "./issues";
import { matchPath } from "react-router";

declare global {
  interface Window {
    // add you custom properties and methods
    matchPath: any;
  }
}

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
    initial: "files",
    states: {
      files: {
        on: {
          ISSUES: {
            target: "issues",
          },
        },
        invoke: {
          id: "files",
          src: filesMachine,
        },
      },
      issues: {
        on: {
          FILES: { target: "files" },
        },
        invoke: {
          id: "issues",
          src: issuesMachine,
        },
      },
    },
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
