import { interpret } from "./rstream-interpretor";
import { createMachine } from "xstate";

const subTestMachine = createMachine<any, any, any>({
  id: "page",
  initial: "loading",
  states: {
    loading: {},
    ready: {},
  },
});

const testMachine = createMachine<any, any, any>({
  id: "test",
  initial: "home",
  states: {
    home: {
      invoke: {
        id: "home",
        src: subTestMachine,
      },
      on: {
        ABOUT: {
          target: "about",
        },
      },
    },
    about: {
      invoke: {
        id: "about",
        src: subTestMachine,
      },
    },
    news: {
      invoke: {
        id: "news",
        src: subTestMachine,
      },
    },
  },
});

test.only("Interpret", () => {
  const service = interpret(testMachine);
  service.subscribe({
    next: (x) => {
      console.log(x);
    },
  });

  service.next({ type: "ABOUT" });
});
