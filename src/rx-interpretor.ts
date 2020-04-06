import { expand, map, mergeMap } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";

const subject = new BehaviorSubject({
  children: {
    sub: new BehaviorSubject({ x: 88 }),
  },
});

const sub = subject.pipe(map(({ children: { sub } }) => sub));

sub.subscribe((inner) => {
  inner.subscribe((x) => {
    console.log(x);
  });
  inner.next({ x: 99 });
});
