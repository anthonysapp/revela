import { Animator } from '../animator/Animator';

export class OverlayTransition {
  private overlayEl: HTMLElement;

  constructor(private animator: Animator, opts?: { color?: string; zIndex?: number }) {
    this.overlayEl = document.createElement('div');
    Object.assign(this.overlayEl.style, {
      position: 'fixed',
      inset: '0',
      background: opts?.color ?? '#000',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: String(opts?.zIndex ?? 9999),
      transform: 'translateY(100%)',
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(this.overlayEl);
  }

  out() {
    return this.animator.tl([
      [this.overlayEl, { opacity: [0, 1] }, { duration: 0.15 }],
      [this.overlayEl, { transform: ['translateY(100%)', 'translateY(0%)'] }, { duration: 0.25 }],
    ]);
  }

  in() {
    return this.animator.tl([
      [this.overlayEl, { transform: ['translateY(0%)', 'translateY(-100%)'] }, { duration: 0.35 }],
      [this.overlayEl, { opacity: [1, 0] }, { duration: 0.15 }],
    ]);
  }
}
