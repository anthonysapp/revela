import { stagger } from "motion";
import { splitText } from "motion-plus";
import { Section, type RevealContext } from "revela";

export class HeroSection extends Section {
  async reveal({ root, animator }: RevealContext) {
    const headline = root.querySelector("[data-hero=headline]") as HTMLElement | null;
    const lead = root.querySelector(".lead") as HTMLElement | null;
    const { chars, words } = splitText(headline!);
    const { lines } = splitText(lead!);
    const ctas = Array.from(root.querySelectorAll("[data-hero=cta]")) as HTMLElement[];

    if (headline) {
      await animator.tl([
        [chars, { x: [5, 0], y: [8, 0], opacity: [0, 1] }, { duration: 0.3, easing: "ease-out", delay: stagger(0.05, { start: 0.25 }) }],
        [lead, { opacity: [0, 1] }, { duration: 0.3, easing: "ease-out" }],
        [lines, { y: [5, 0], opacity: [0, 1] }, { duration: 0.4, easing: "ease-out", delay: stagger(0.05) }],
        [ctas, { opacity: [0, 1], y: [7, 0] }, { duration: 0.4, easing: "ease-out", delay: stagger(0.05) }],
      ]).finished;
    }
  }
}
