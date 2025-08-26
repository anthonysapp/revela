import { Section, type RevealContext } from "revela";

export class ContentRevealSection extends Section {
  async reveal({ root, animator }: RevealContext) {
    const blocks = Array.from(root.querySelectorAll("[data-content=block]")) as HTMLElement[];

    // Stagger reveal each content block with a smooth fade-up animation
    if (blocks.length > 0) {
      await animator.stagger(
        blocks,
        {
          opacity: [0, 1],
          transform: ["translateY(24px)", "translateY(0)"],
        },
        {
          duration: 0.6,
          delayStep: 0.2,
          easing: "ease-out",
        },
      ).finished;
    }

    // Event dispatching is now handled automatically by Section
  }
}
