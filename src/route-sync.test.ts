import { routeSync } from "./route-sync";
import { createMachine, interpret, StateNode, State } from "xstate";
import { from, of, merge, Observable } from "rxjs";
import { expand, map } from "rxjs/operators";
import { create } from "domain";
import { initEvent } from "xstate/lib/actions";

const subSubTestMachine = createMachine<any, any, any>({
  id: "page",
  initial: "bla",
  states: {
    bla: {},
  },
});

const subTestMachine = createMachine<any, any, any>({
  id: "page",
  initial: "loading",
  states: {
    loading: {
      invoke: {
        id: "sub",
        src: subSubTestMachine,
      },
    },
    ready: {},
  },
});

type TestContext = never;

type TestEvt = { type: "ABOUT" };

type TestState = {
  value: "home" | "about" | "news";
  context: TestContext;
};

const testMachine = createMachine<TestContext, TestEvt, TestState>({
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

const rootMachine = createMachine<any, any, any>({
  id: "root",
  initial: "ready",
  states: {
    ready: {
      invoke: {
        id: "test",
        src: testMachine,
      },
    },
  },
});

const routeSyncConfig = {
  test: (current) => {
    return current.value;
  },
  home: (current) => {
    return current.value;
  },
  about: (current) => {
    return current.value;
  },
  sub: (current) => {
    return current.value;
  },
};

test("Remove", () => {
  const service = interpret(testMachine as any).start();

  const obs: Observable<any> = from(service);

  const allEvents = obs.pipe(
    map((val) => [val, []]),
    // Recursively process children of root service
    expand((current) => {
      const [val, path] = current;
      return merge(
        ...Object.keys(val.children).map((k) =>
          from(val.children[k]).pipe(
            // Wrap actual value to add some metadata
            map((current) => {
              return [current, [...path, k]];
            })
          )
        )
      );
    })
  );

  allEvents.subscribe(
    ([state, path]) => {
      console.log(state);
      console.log(path);
    },
    (e) => {
      console.log(e);
    }
  );

  service.send({ type: "ABOUT" });
});

test("Route sync", () => {
  const service = interpret(rootMachine as any).start();

  const routes = routeSync(service, routeSyncConfig);

  // Find some way to collapse these into a single event
  routes.subscribe((x) => {
    console.log(x);
  });

  // service.send({ type: "ABOUT" });
});

test("Temp: state transitions", () => {
  // Prep machine

  console.log(testMachine.initialState.children);

  const state1 = testMachine.transition(testMachine.initialState, {
    type: "ABOUT",
  });

  console.log(state1.children);

  const service1 = interpret(testMachine as any).start();

  let snap: any = testMachine.initialState;

  service1.subscribe((current) => {
    // console.log(current.children);
    if (current.event.type === "ABOUT") {
      snap = current;
      console.log(current.children);
    }
  });

  service1.send({ type: "ABOUT" });

  const service2 = interpret(testMachine as any).start(snap);

  service2.subscribe((x) => {
    console.log(x.children);
  });

  const {
    configuration,
    transitions,
    ...initialState
  } = testMachine.initialState;

  const testMachineRestored = {
    ...testMachine,
    initialState: testMachine.resolveState({
      ...initialState,
      value: "about",
    } as any),
  }; /*?*/

  const service3 = interpret(testMachineRestored as any).start(
    testMachine.resolve()
  );

  service3.subscribe((x /*?*/) => {
    console.log(x.children);
    console.log(x.children.about);
  });
});
