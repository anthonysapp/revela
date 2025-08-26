import { Section, type RevealContext } from "revela";

export class CardGridSection extends Section<{ childSelector?: string }> {
  protected onInit() {
    this.opts ??= { childSelector: "[data-card]" };
  }

  async reveal({ root, animator }: RevealContext) {
    const cards = Array.from(root.querySelectorAll(this.opts.childSelector!)) as HTMLElement[];
    await animator.stagger(cards, { opacity: [0, 1], y: [16, 0] }, { duration: 0.28, delayStep: 0.05 }).finished;
  }
}
