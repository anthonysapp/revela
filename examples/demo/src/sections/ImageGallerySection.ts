import { stagger } from "motion";
import { Section, type RevealContext } from "revela";

export class ImageGallerySection extends Section {
  async reveal({ root, animator }: RevealContext) {
    const title = root.querySelector("[data-gallery=title]") as HTMLElement | null;
    const subtitle = root.querySelector("[data-gallery=subtitle]") as HTMLElement | null;
    const images = Array.from(root.querySelectorAll("[data-gallery=image]")) as HTMLElement[];

    // Use timeline for smoother sequencing
    const timeline = [];

    if (title) {
      timeline.push([[title, subtitle], { transform: "translateY(0)", opacity: 1 }, { duration: 0.4, easing: "ease-out", delay: stagger(0.15) }]);
    }

    if (timeline.length > 0) {
      await animator.tl(timeline).finished;
    }

    // Then stagger in the images with a fade-up effect
    if (images.length > 0) {
      await animator.stagger(
        images,
        {
          opacity: [0, 1],
          transform: ["translateY(40px) scale(0.9)", "translateY(0) scale(1)"],
        },
        {
          duration: 0.8,
          delayStep: 0.15,
          easing: "ease-out",
        },
      ).finished;
    }
  }
}
