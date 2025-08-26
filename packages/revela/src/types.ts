import type { Animator } from "./animator/Animator";
import type { Section } from "./core/Section";

export type SectionName = string;

export interface SectionOptions {}

export interface RevealContext {
  root: HTMLElement;
  animator: Animator;
  isFirstPaint: boolean;
}

export interface SectionsPathConfig {
  path: string;
  pattern?: string; // Default: '**/*Section.{ts,js}'
  nameTransform?: (filename: string) => string; // Custom name conversion
  include?: string[]; // Only include these sections
  exclude?: string[]; // Exclude these sections
}

export interface EngineConfig {
  discoverSelector?: string; // default: [data-revela-section]
  sections?: Record<SectionName, new (el: HTMLElement) => Section<any>>;
  sectionsPath?: string; // Auto-discover sections from path (e.g. "./sections")
  glob?: Record<string, any>; // Pre-imported modules from import.meta.glob (advanced use)
  reducedMotion?: "respect" | "ignore";
  overlay?: { enabled: boolean; color?: string; zIndex?: number };
  batchReveals?: {
    enabled: boolean;
    strategy?: "topToBottom" | "bottomToTop" | "center" | "wait" | "custom";
    delayStep?: number; // ms between each reveal (ignored for "wait" strategy)
    maxBatchSize?: number; // max sections to batch together
    customDelayFn?: (sections: SectionInstance[], index: number) => number;
  };
}

export interface SectionInstance<T extends Section = Section> {
  name: SectionName;
  el: HTMLElement;
  section: T;
  index: number; // DOM discovery order
  top: number; // cached distance from viewport top (px)
  isVisible: boolean;
  hasRevealed: boolean; // tracks if reveal animation has been triggered
}

export interface SectionEvents {
  [key: string]: (...a: any[]) => void; // <— add this line
  /** Visible sections changed (ordered top → bottom) */
  visibleChange: (visible: SectionInstance[]) => void;
  /** Top-most visible section changed (or undefined if none) */
  topVisibleChange: (top: SectionInstance | undefined) => void;
}
