/**
 * Utility functions for loading sections via glob imports
 */
import type { Section } from "../core/Section";
import { pascalToKebabCase } from "./naming";

// Type definitions for Vite's import.meta.glob
declare global {
  interface ImportMeta {
    glob?: (pattern: string, options?: { eager?: boolean }) => Record<string, any>;
  }
}

// Type for webpack's require.context
interface RequireContext {
  keys(): string[];
  (id: string): any;
  <T>(id: string): T;
  resolve(id: string): string;
  id: string;
}

export interface SectionsPathConfig {
  path: string;
  pattern?: string; // Default: '**/*Section.{ts,js}'
  nameTransform?: (filename: string) => string; // Custom name conversion
  include?: string[]; // Only include these sections
  exclude?: string[]; // Exclude these sections
}

/**
 * Load sections from pre-imported modules using Vite's import.meta.glob
 * This function processes the result of import.meta.glob() calls
 *
 * @example
 * ```typescript
 * // In your main.ts file:
 * const sectionModules = import.meta.glob('./sections/*Section.ts', { eager: true });
 * const sections = loadSectionsFromModules(sectionModules);
 *
 * const revela = new Revela({ sections });
 * ```
 */
export function loadSectionsFromModules(modules: Record<string, any>, config?: Omit<SectionsPathConfig, "path" | "pattern">): Record<string, new (el: HTMLElement) => Section> {
  const { nameTransform, include, exclude } = config || {};
  const sections: Record<string, new (el: HTMLElement) => Section> = {};

  for (const [modulePath, module] of Object.entries(modules)) {
    // Extract filename: './src/sections/HeroSection.ts' → 'HeroSection'
    const filename =
      modulePath
        .split("/")
        .pop()
        ?.replace(/\.(ts|js)$/, "") || "";

    // Apply include/exclude filters
    if (include && !include.includes(filename)) continue;
    if (exclude && exclude.includes(filename)) continue;

    // Convert PascalCase class name to kebab-case section name
    const sectionName = nameTransform ? nameTransform(filename) : pascalToKebabCase(filename);

    // Get the Section class (try default export first, then named export)
    const SectionClass = module.default || module[filename];

    if (SectionClass && typeof SectionClass === "function") {
      sections[sectionName] = SectionClass;
    } else {
      console.warn(`Could not find Section class in ${modulePath}. Make sure it's the default export.`);
    }
  }

  return sections;
}

/**
 * @deprecated Use sectionModules with import.meta.glob instead
 *
 * @example
 * ```typescript
 * const sectionModules = import.meta.glob('./sections/*Section.ts', { eager: true });
 * const revela = new Revela({ sectionModules });
 * ```
 */
export function loadSectionsFromPath(config: string | SectionsPathConfig): Record<string, new (el: HTMLElement) => Section> {
  throw new Error("loadSectionsFromPath() is deprecated because import.meta.glob must be called from user code. " + "Use the sectionModules approach instead:\n\n" + "const sectionModules = import.meta.glob('./sections/*Section.ts', { eager: true });\n" + "const revela = new Revela({ sectionModules });");
}

/**
 * Fallback for non-Vite bundlers using require.context (webpack)
 */
export function createSectionsRegistry(requireContext: RequireContext, nameTransform?: (filename: string) => string): Record<string, new (el: HTMLElement) => Section> {
  const sections: Record<string, new (el: HTMLElement) => Section> = {};

  requireContext.keys().forEach((modulePath: string) => {
    const module = requireContext(modulePath);
    const filename =
      modulePath
        .split("/")
        .pop()
        ?.replace(/\.(ts|js)$/, "") || "";

    const sectionName = nameTransform ? nameTransform(filename) : pascalToKebabCase(filename);

    const SectionClass = module.default || module[filename];

    if (SectionClass && typeof SectionClass === "function") {
      sections[sectionName] = SectionClass;
    }
  });

  return sections;
}
