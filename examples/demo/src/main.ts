import { Revela } from "revela";
import Swup from "swup";

const revela = new Revela({
  swup: new Swup({}),
  glob: import.meta.glob!("./sections/*.ts", { eager: true }),
  overlay: { enabled: true, color: "#0f172a", zIndex: 9999 },
  reducedMotion: "respect",
  batchReveals: {
    enabled: true,
    maxBatchSize: 5,
    strategy: "wait",
  },
});

// That's it! The framework automatically:
// - Finds all *.ts files in ./sections/
// - Converts class names: HeroSection → "hero"
// - Converts class names: CardGridSection → "card-grid"
// - Maps them to data-revela-section attributes in HTML

// Clean event listener API - no need to access .discovery
revela.on("visibleChange", (visible) => {
  // console.log('visible:', visible.map(v => `${v.name}#${v.index}`));
});

revela.on("topVisibleChange", (top) => {
  console.log("top:", top ? `${top.name}#${top.index}` : "(none)");
});
