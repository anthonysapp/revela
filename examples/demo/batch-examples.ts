// Example configurations for batch reveals

import { Revela } from "revela";
import Swup from "swup";

/*
HTML data-reveal-time Examples:

<!-- Fast reveal - 0.8 seconds -->
<section data-section="mySection" data-reveal-time="0.8">...</section>

<!-- Normal reveal - 2.5 seconds -->
<section data-section="mySection" data-reveal-time="2.5">...</section>

<!-- Slow reveal - 4.0 seconds -->
<section data-section="mySection" data-reveal-time="4.0">...</section>

<!-- No timing override - waits for animation completion -->
<section data-section="mySection">...</section>
*/

const swup = new Swup({});

// 1. Basic top-to-bottom staggering (Recommended)
const basicConfig = new Revela({
  swup,
  sections: {
    /* your sections */
  },
  batchReveals: {
    enabled: true,
    strategy: "topToBottom",
    delayStep: 200, // 200ms between each reveal
    maxBatchSize: 3, // Maximum 3 sections per batch
  },
});

// 2. No swup - standalone usage
const standaloneConfig = new Revela({
  sections: {
    /* your sections */
  },
  batchReveals: {
    enabled: true,
    strategy: "bottomToTop",
    delayStep: 150,
  },
});

// 3. Center-out reveal (focus on center content first)
const centerOutConfig = new Revela({
  swup,
  sections: {
    /* your sections */
  },
  batchReveals: {
    enabled: true,
    strategy: "center",
    delayStep: 100,
  },
});

// 4. Custom delay algorithm
const customConfig = new Revela({
  swup,
  sections: {
    /* your sections */
  },
  batchReveals: {
    enabled: true,
    strategy: "custom",
    customDelayFn: (sections, index) => {
      // Example: Exponential backoff
      return Math.pow(index, 1.5) * 100;

      // Example: Wave pattern
      // return Math.sin(index * 0.5) * 200 + 300;

      // Example: Random delays
      // return Math.random() * 400 + 100;

      // Example: Based on section type
      // const section = sections[index];
      // if (section.name === 'hero') return 0;
      // if (section.name === 'imageGallery') return 500;
      // return index * 150;
    },
  },
});

// 5. Performance-optimized for many sections
const performanceConfig = new Revela({
  swup,
  sections: {
    /* your sections */
  },
  batchReveals: {
    enabled: true,
    strategy: "topToBottom",
    delayStep: 50, // Faster reveals
    maxBatchSize: 5, // Larger batches
  },
});

// 6. Sequential wait strategy (each waits for previous to complete)
const waitConfig = new Revela({
  swup,
  sections: {
    /* your sections */
  },
  batchReveals: {
    enabled: true,
    strategy: "wait", // Each section waits for previous to finish completely
    maxBatchSize: 5, // Process 5 sections sequentially, then start next batch
    // Note: delayStep is ignored for "wait" strategy since timing is based on completion
  },
});

// 7. Perfect for complex animations that need to finish before next starts
const choreographedConfig = new Revela({
  swup,
  sections: {
    /* your sections */
  },
  batchReveals: {
    enabled: true,
    strategy: "wait",
    maxBatchSize: 2, // Very controlled - only 2 sections in sequence at a time
  },
});

// 8. Cinematic slow reveals
const cinematicConfig = new Revela({
  swup,
  sections: {
    /* your sections */
  },
  batchReveals: {
    enabled: true,
    strategy: "topToBottom",
    delayStep: 800, // Very slow, dramatic
    maxBatchSize: 2, // Small batches for control
  },
});

export {
  basicConfig,
  centerOutConfig,
  choreographedConfig,
  cinematicConfig,
  customConfig,
  performanceConfig,
  standaloneConfig,
  waitConfig,
};
