// packages/revela/src/animator/Animator.ts
import { animate, stagger, timeline, type AnimationControls } from "motion";

// Keep types simple to avoid Motion One overload headaches
export type KeyframeDef = any;
export type AnimateOpts = Record<string, unknown>;

export class Animator {
  constructor(private respectReducedMotion = true) {}

  animate(
    el: Element | Element[],
    keyframes: KeyframeDef,
    opts: AnimateOpts = {}
  ): AnimationControls {
    if (this.shouldReduce()) return { finished: Promise.resolve() } as any;
    return animate(el as any, keyframes as any, opts as any);
  }

  tl(steps: any[], opts: AnimateOpts = {}): AnimationControls {
    if (this.shouldReduce()) return { finished: Promise.resolve() } as any;
    return timeline(steps as any, opts as any);
  }

  stagger(
    children: Element[],
    keyframes: KeyframeDef,
    opts: AnimateOpts & { delayStep?: number } = {}
  ): AnimationControls {
    const { delayStep = 0.075, ...rest } = opts || {};
    return animate(children, keyframes, {
      ...(rest as any),
      delay: (opts as any).delay ?? stagger(delayStep),
    });
  }

  private shouldReduce() {
    return (
      this.respectReducedMotion &&
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }
}
