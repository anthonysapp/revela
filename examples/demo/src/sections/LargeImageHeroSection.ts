import { Section, type RevealContext } from "revela";
import { revealSubtle } from "../animation";

export class LargeImageHeroSection extends Section {
  async reveal({ root, animator }: RevealContext) {
    const container = root.querySelector("[data-large-image=container]") as HTMLElement | null;
    const image = root.querySelector("[data-large-image=image]") as HTMLElement | null;
    const content = root.querySelector("[data-large-image=content]") as HTMLElement | null;

    const promises: Promise<void>[] = [];

    if (container && image) {
      // Animate the container with a subtle scale effect
      promises.push(
        animator.animate(
          container,
          {
            opacity: [0, 1],
            transform: ["scale(0.95)", "scale(1)"],
          },
          { duration: 0.8, easing: revealSubtle },
        ).finished,
      );

      promises.push(
        animator.animate(
          image,
          {
            transform: ["scale(1.1)", "scale(1)"],
            opacity: [0.8, 1],
          },
          { duration: 0.8, easing: revealSubtle, delay: 0.2 },
        ).finished,
      );
    }

    if (content) {
      // Animate the overlay content
      promises.push(
        animator.animate(
          content,
          {
            y: [20, 0],
            opacity: [0, 1],
          },
          { duration: 0.6, easing: revealSubtle, delay: 0.4 },
        ).finished,
      );
    }

    await Promise.all(promises);
  }
}
