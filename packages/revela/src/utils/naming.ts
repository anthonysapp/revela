/**
 * Utility functions for converting between different naming conventions
 */

/**
 * Convert kebab-case to PascalCase
 * @example "large-hero-image" → "LargeHeroImage"
 */
export function kebabToPascalCase(kebab: string): string {
  return kebab
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Convert PascalCase to kebab-case, removing "Section" suffix if present
 * @example "LargeHeroImageSection" → "large-hero-image"
 */
export function pascalToKebabCase(pascal: string): string {
  return pascal
    .replace(/Section$/, "") // Remove 'Section' suffix first
    .replace(/([A-Z])/g, (match, letter, index) => {
      return index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`;
    });
}

/**
 * Convert kebab-case to camelCase
 * @example "large-hero-image" → "largeHeroImage"
 */
export function kebabToCamelCase(kebab: string): string {
  const pascal = kebabToPascalCase(kebab);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Try multiple naming strategies to find a section class
 * Returns the first successful lookup
 */
export function tryNamingStrategies(kebabName: string, registry: { get(name: string): any }): any {
  const strategies = [
    kebabName, // Direct: "card-grid"
    kebabToCamelCase(kebabName), // camelCase: "cardGrid"
    kebabToPascalCase(kebabName), // PascalCase: "CardGrid"
    kebabToPascalCase(kebabName) + "Section", // With suffix: "CardGridSection"
  ];

  for (const name of strategies) {
    const result = registry.get(name);
    if (result) return result;
  }

  return undefined;
}
