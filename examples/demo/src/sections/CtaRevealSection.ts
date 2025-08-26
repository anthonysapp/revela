import { stagger } from "motion";
import { Section, type RevealContext } from "revela";

export class CtaRevealSection extends Section {
  async reveal({ root, animator }: RevealContext) {
    const content = root.querySelector("[data-cta=content]") as HTMLElement | null;
    const buttons = Array.from(root.querySelectorAll("[data-cta=button]")) as HTMLElement[];

    if (content) {
      // Animate the main content block
      await animator.animate(
        content,
        {
          y: [40, 0],
          opacity: [0, 1],
        },
        { duration: 0.7, easing: "ease-out" },
      ).finished;
    }

    // Then stagger in the buttons
    if (buttons.length > 0) {
      await animator.animate(
        buttons,
        {
          opacity: [0, 1],
          transform: ["translateY(16px)", "translateY(0)"],
        },
        {
          duration: 0.4,
          easing: "ease-out",
          delay: stagger(0.1),
        },
      ).finished;
    }
  }
}
