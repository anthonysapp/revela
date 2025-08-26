import type Swup from "swup";
import { Animator } from "../animator/Animator";
import { OverlayTransition } from "../features/OverlayTransition";
import type { EngineConfig, SectionInstance } from "../types";
import { loadSectionsFromModules } from "../utils/sectionsLoader";
import { SectionDiscovery } from "./SectionDiscovery";

type RegistryLike = {
  get(name: string): (new (el: HTMLElement) => any) | undefined;
};

export class Revela {
  public readonly discovery!: SectionDiscovery;
  private overlay?: OverlayTransition;
  private animator: Animator;
  private swup?: Swup;

  constructor(private cfg: EngineConfig & { swup?: Swup }) {
    this.animator = new Animator(cfg.reducedMotion !== "ignore");

    // Initialize with sections from various sources
    let sections: NonNullable<EngineConfig["sections"]>;

    if (cfg.sections) {
      sections = cfg.sections;
    } else if (cfg.glob) {
      sections = loadSectionsFromModules(cfg.glob);
    } else if (cfg.sectionsPath) {
      throw new Error("sectionsPath is deprecated. Use sectionModules instead:\n\n" + "const sectionModules = import.meta.glob('./sections/*Section.ts', { eager: true });\n" + "const revela = new Revela({ sectionModules });");
    } else {
      throw new Error("Either 'sections' or 'sectionModules' must be provided in EngineConfig");
    }

    this.initializeWithSections(sections);
  }

  private initializeWithSections(sections: NonNullable<EngineConfig["sections"]>) {
    const registry: RegistryLike = { get: (k: string) => sections[k] };
    (this as any).discovery = new SectionDiscovery(registry as any, this.animator, this.cfg.discoverSelector ?? "[data-revela-section]", this.cfg.batchReveals);
    if (this.cfg.overlay?.enabled) this.overlay = new OverlayTransition(this.animator, this.cfg.overlay);

    // Auto-attach swup if provided
    if (this.cfg.swup) {
      this.attach(this.cfg.swup);
    } else {
      // No swup - just do initial discovery
      this.discovery.discover(document, true);
    }
  }

  // Event delegation methods for cleaner API
  on(event: "visibleChange", callback: (visible: SectionInstance[]) => void): void;
  on(event: "topVisibleChange", callback: (top: SectionInstance | undefined) => void): void;
  on(event: string, callback: (...args: any[]) => void): void {
    this.discovery.on(event as any, callback);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    this.discovery.off(event as any, callback);
  }

  private attach(swup: Swup) {
    this.swup = swup;

    // initial discovery
    this.discovery.discover(document, true);

    // swup v4 hook system
    swup.hooks.on("animation:out:start", () => {
      this.overlay?.out();
      this.discovery.destroyAll();
    });

    swup.hooks.on("content:replace", () => {
      this.discovery.discover(document, false);
    });

    swup.hooks.on("animation:in:end", () => {
      this.overlay?.in();
    });
  }

  // Public method for manual attachment if needed
  attachSwup(swup: Swup) {
    if (this.swup) {
      console.warn("Swup already attached to Revela instance");
      return;
    }
    this.attach(swup);
  }
}
