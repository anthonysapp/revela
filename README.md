![Revela: scroll reveals and page transitions, one lifecycle.](.github/revela.png)

# Revela

Scroll reveals and page transitions in one small engine.

Revela is a small TypeScript engine for animated websites. It ties reveal-on-scroll sections and [Swup](https://swup.js.org) page transitions into one lifecycle, with motion from [motion.dev](https://motion.dev). Bring your own styles. Revela handles structure, discovery and timing.

- **Sections find themselves.** Write a section class, mark the HTML with `data-revela-section`, and Revela wires them up. `HeroSection` becomes `hero`, `CardGridSection` becomes `card-grid`.
- **Reveals are batched.** Sections that enter the view together animate together.
- **Page swaps just work.** After every Swup page change, Revela finds the new sections, so new content still animates in.
- **Overlay transitions** between pages, which you can extend.
- **Respects reduced motion.**
- About 20 KB.

## Quick look

```ts
import { Revela } from "revela";
import Swup from "swup";

const revela = new Revela({
  swup: new Swup({}),
  glob: import.meta.glob("./sections/*.ts", { eager: true }),
  overlay: { enabled: true, color: "#0f172a", zIndex: 9999 },
  reducedMotion: "respect",
  batchReveals: { enabled: true, maxBatchSize: 5, strategy: "wait" },
});

revela.on("visibleChange", (visible) => {
  // sections currently in view
});
```

## Try the demo

```sh
pnpm install
pnpm build
pnpm dev
```

The demo lives in `examples/demo`.

## Status

Early, v0.1. Not published to npm yet. Peer dependencies: `motion`, `swup`.

## License

MIT
