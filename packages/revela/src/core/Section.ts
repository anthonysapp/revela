import { Animator } from "../animator/Animator";
import type { RevealContext, SectionOptions } from "../types";

export abstract class Section<TOpts extends SectionOptions = SectionOptions> {
  protected opts!: TOpts;
  protected animator!: Animator;
  private sectionName?: string;

  constructor(public readonly el: HTMLElement) {}

  init(ctx: { animator: Animator; options?: TOpts; sectionName?: string }) {
    this.animator = ctx.animator;
    if (ctx.options) this.opts = ctx.options;
    this.sectionName = ctx.sectionName;
    this.onInit();
  }

  /** called once when created */
  protected onInit() {}

  /** called when it should reveal (e.g., on enter viewport or immediately) */
  abstract reveal(ctx: RevealContext): Promise<void> | void;

  /** Internal method that handles reveal and dispatches event */
  async performReveal(ctx: RevealContext): Promise<void> {
    // Check if section has a custom reveal time override
    const revealTimeAttr = this.el.dataset.revealTime;
    if (revealTimeAttr) {
      // Use custom timing instead of waiting for reveal completion
      const revealTimeSeconds = parseFloat(revealTimeAttr);
      if (!isNaN(revealTimeSeconds) && revealTimeSeconds >= 0) {
        // Start the reveal animation but don't wait for it
        this.reveal(ctx);

        // Wait for the specified time instead
        await new Promise((resolve) => setTimeout(resolve, revealTimeSeconds * 1000));
      } else {
        // Invalid time value, fall back to normal behavior
        await this.reveal(ctx);
      }
    } else {
      // Normal behavior - wait for reveal to complete
      await this.reveal(ctx);
    }

    // Auto-dispatch the revela:reveal event
    this.el.dispatchEvent(
      new CustomEvent("revela:reveal", {
        bubbles: true,
        detail: { name: this.sectionName || this.el.dataset.revelaSection },
      }),
    );
  }

  /** called before removal or page leave */
  destroy() {}
}
