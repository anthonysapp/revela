import { Section, type RevealContext } from "revela";

export class FadeImagesSection extends Section {
  async reveal({ root, animator }: RevealContext) {
    const title = root.querySelector("[data-fade=title]") as HTMLElement | null;
    const items = Array.from(root.querySelectorAll("[data-fade=item]")) as HTMLElement[];

    // First reveal the title
    if (title) {
      await animator.animate(title, { y: [24, 0], opacity: [0, 1] }, { duration: 0.5, easing: "ease-out" }).finished;
    }

    // Then fade in the images with a wave-like stagger
    if (items.length > 0) {
      await animator.stagger(
        items,
        {
          opacity: [0, 1],
          transform: ["translateY(20px)", "translateY(0)"],
        },
        {
          duration: 0.7,
          delayStep: 0.1,
          easing: "ease-out",
        },
      ).finished;
    }

    // Event dispatching is now handled automatically by Section
  }
}
