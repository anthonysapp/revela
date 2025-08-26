import { Animator } from "../animator/Animator";
import type { SectionEvents, SectionInstance } from "../types";
import { tryNamingStrategies } from "../utils/naming";
import { Emitter } from "./Emitter";
import { Section } from "./Section";

type RegistryLike = {
  get(name: string): (new (el: HTMLElement) => Section) | undefined;
};

export class SectionDiscovery {
  private byName = new Map<string, SectionInstance[]>();
  private all: SectionInstance[] = [];
  private io?: IntersectionObserver;
  private raf?: number;

  // events
  private emitter = new Emitter<SectionEvents>();
  on = this.emitter.on.bind(this.emitter);
  off = this.emitter.off.bind(this.emitter);

  private lastVisibleKeys = "";
  private lastTopKey = "";

  // batching
  private pendingReveals: SectionInstance[] = [];
  private batchTimer?: number;

  constructor(
    private registry: RegistryLike,
    private animator: Animator,
    private discoverSelector = "[data-revela-section]",
    private batchConfig?: NonNullable<import("../types").EngineConfig["batchReveals"]>,
  ) {}

  /** discover sections under root and wire up visibility tracking */
  discover(root: ParentNode, isFirstPaint: boolean) {
    this.teardownIO();

    const nodes = Array.from(root.querySelectorAll<HTMLElement>(this.discoverSelector));
    nodes.forEach((el, index) => {
      const kebabName = el.dataset.revelaSection!;
      const Ctor = tryNamingStrategies(kebabName, this.registry);
      if (!Ctor) return;

      const section = new Ctor(el);
      section.init({ animator: this.animator, sectionName: kebabName });

      const inst: SectionInstance = {
        name: kebabName,
        el,
        section,
        index,
        top: el.getBoundingClientRect().top,
        isVisible: false,
        hasRevealed: false,
      };

      this.all.push(inst);
      const list = this.byName.get(kebabName) ?? [];
      list.push(inst);
      this.byName.set(kebabName, list);

      if (el.dataset.reveal === "immediate") {
        inst.hasRevealed = true;
        section.performReveal({
          root: el,
          animator: this.animator,
          isFirstPaint,
        });
      }
    });

    this.io = new IntersectionObserver(this.onIntersect, {
      root: null,
      threshold: [0, 0.2, 0.5, 1],
      rootMargin: "0px 0px -10% 0px",
    });
    this.all.forEach((inst) => this.io!.observe(inst.el));

    const tick = () => {
      this.samplePositions();
      this.maybeEmitChanges();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  destroyAll() {
    this.teardownIO();
    this.all.forEach((inst) => inst.section.destroy());
    this.byName.clear();
    this.all = [];
    this.lastVisibleKeys = "";
    this.lastTopKey = "";
  }

  // queries
  getAll(): SectionInstance[] {
    return [...this.all].sort((a, b) => a.index - b.index);
  }
  getByName<T extends Section = Section>(name: string): SectionInstance<T>[] {
    return [...(this.byName.get(name) ?? [])].sort((a, b) => a.index - b.index) as any;
  }
  getVisible(): SectionInstance[] {
    return this.getAll()
      .filter((s) => s.isVisible)
      .sort((a, b) => a.top - b.top);
  }
  getTopVisible(): SectionInstance | undefined {
    return this.getVisible()[0];
  }
  getVisibleAfterTop(): SectionInstance[] {
    const v = this.getVisible();
    return v.length ? v.slice(1) : [];
  }
  getAllAfterTopVisible(): SectionInstance[] {
    const all = this.getAll();
    const top = this.getTopVisible();
    if (!top) return [];
    const i = all.findIndex((s) => s === top);
    return i >= 0 ? all.slice(i + 1) : [];
  }

  // internals
  private onIntersect: IntersectionObserverCallback = (entries) => {
    for (const entry of entries) {
      const inst = this.lookupByEl(entry.target as HTMLElement);
      if (!inst) continue;

      const nowVisible = entry.isIntersecting && entry.intersectionRatio > 0;
      if (nowVisible && !inst.hasRevealed && inst.el.dataset.reveal !== "immediate") {
        if (this.batchConfig?.enabled) {
          this.queueReveal(inst);
        } else {
          inst.hasRevealed = true;
          inst.section.performReveal({
            root: inst.el,
            animator: this.animator,
            isFirstPaint: false,
          });
        }
      }
      inst.isVisible = nowVisible;
      inst.top = inst.el.getBoundingClientRect().top;
    }
  };

  private queueReveal(inst: SectionInstance) {
    // Double-check hasRevealed status and prevent duplicate queueing
    if (inst.hasRevealed || this.pendingReveals.includes(inst)) return;

    this.pendingReveals.push(inst);
    // Mark as revealed immediately to prevent re-queueing
    inst.hasRevealed = true;

    // Clear existing timer and set new one
    if (this.batchTimer) clearTimeout(this.batchTimer);

    this.batchTimer = window.setTimeout(() => {
      this.processBatch();
    }, 50); // Small delay to collect multiple reveals
  }

  private async processBatch() {
    if (this.pendingReveals.length === 0) return;

    const batch = [...this.pendingReveals];
    this.pendingReveals = [];
    this.batchTimer = undefined;

    // Limit batch size if configured
    const maxSize = this.batchConfig?.maxBatchSize ?? batch.length;
    const toReveal = batch.slice(0, maxSize);

    // Put remaining back in queue if any
    if (batch.length > maxSize) {
      this.pendingReveals = batch.slice(maxSize);
      this.queueReveal(this.pendingReveals[0]); // Re-trigger processing
    }

    await this.revealBatch(toReveal);
  }

  private async revealBatch(sections: SectionInstance[]) {
    // Sort sections based on strategy
    const sorted = this.sortSectionsForReveal(sections);
    const strategy = this.batchConfig?.strategy ?? "topToBottom";

    if (strategy === "wait") {
      // Sequential reveals - wait for each to complete before starting next
      for (const inst of sorted) {
        await inst.section.performReveal({
          root: inst.el,
          animator: this.animator,
          isFirstPaint: false,
        });
      }
    } else {
      // Parallel reveals with staggered timing
      const reveals = sorted.map(async (inst, index) => {
        const delay = this.calculateDelay(sorted, index);

        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        await inst.section.performReveal({
          root: inst.el,
          animator: this.animator,
          isFirstPaint: false,
        });
      });

      await Promise.all(reveals);
    }
  }

  private sortSectionsForReveal(sections: SectionInstance[]): SectionInstance[] {
    const strategy = this.batchConfig?.strategy ?? "topToBottom";

    switch (strategy) {
      case "topToBottom":
      case "wait": // Wait strategy uses same sorting as topToBottom
        return [...sections].sort((a, b) => a.top - b.top);
      case "bottomToTop":
        return [...sections].sort((a, b) => b.top - a.top);
      case "center":
        // Sort by distance from center of viewport
        const centerY = window.innerHeight / 2;
        return [...sections].sort((a, b) => Math.abs(a.top - centerY) - Math.abs(b.top - centerY));
      case "custom":
        return sections; // Custom delay function will handle timing
      default:
        return sections;
    }
  }

  private calculateDelay(sections: SectionInstance[], index: number): number {
    if (this.batchConfig?.customDelayFn) {
      return this.batchConfig.customDelayFn(sections, index);
    }

    const delayStep = this.batchConfig?.delayStep ?? 150;
    return index * delayStep;
  }

  private samplePositions() {
    for (const inst of this.all) inst.top = inst.el.getBoundingClientRect().top;
  }

  private maybeEmitChanges() {
    const vis = this.getVisible();
    const visKey = vis.map((v) => this.keyFor(v)).join("|");
    if (visKey !== this.lastVisibleKeys) {
      this.lastVisibleKeys = visKey;
      this.emitter.emit("visibleChange", vis);
    }
    const top = vis[0];
    const topKey = top ? this.keyFor(top) : "";
    if (topKey !== this.lastTopKey) {
      this.lastTopKey = topKey;
      this.emitter.emit("topVisibleChange", top);
    }
  }

  private keyFor(inst: SectionInstance) {
    return `${inst.name}#${inst.index}`;
  }
  private lookupByEl(el: HTMLElement) {
    return this.all.find((i) => i.el === el);
  }

  private teardownIO() {
    if (this.io) {
      this.io.disconnect();
      this.io = undefined;
    }
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = undefined;
    }
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }
    this.pendingReveals = [];
    this.emitter.clear();
  }
}
