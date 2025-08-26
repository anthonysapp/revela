import { Revela } from "revela";
import Swup from "swup";
import { CardGridSection } from "./sections/CardGridSection";
import { ContentRevealSection } from "./sections/ContentRevealSection";
import { CtaRevealSection } from "./sections/CtaRevealSection";
import { FadeImagesSection } from "./sections/FadeImagesSection";
import { HeroSection } from "./sections/HeroSection";
import { ImageGallerySection } from "./sections/ImageGallerySection";
import { LargeImageHeroSection } from "./sections/LargeImageHeroSection";

const swup = new Swup({});

const revela = new Revela({
  swup,
  sections: {
    hero: HeroSection,
    "card-grid": CardGridSection,
    "image-gallery": ImageGallerySection,
    "content-reveal": ContentRevealSection,
    "large-image-hero": LargeImageHeroSection,
    "fade-images": FadeImagesSection,
    "cta-reveal": CtaRevealSection,
  },
  overlay: { enabled: true, color: "#0f172a", zIndex: 9999 },
  reducedMotion: "respect",
  batchReveals: {
    enabled: true,
    maxBatchSize: 5,
    strategy: "wait",
    // strategy: "custom",
    // customDelayFn(sections, index) {
    //   return Math.pow(index, 1.5) * 250;
    // },
  },
});

// Clean event listener API - no need to access .discovery
revela.on("visibleChange", (visible) => {
  // console.log('visible:', visible.map(v => `${v.name}#${v.index}`));
});

revela.on("topVisibleChange", (top) => {
  console.log("top:", top ? `${top.name}#${top.index}` : "(none)");
});
