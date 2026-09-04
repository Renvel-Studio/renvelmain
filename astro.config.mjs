import { defineConfig } from "astro/config";

// https://astro.build/config
// NOTE: sitemap.xml is maintained by hand in public/ — the @astrojs/sitemap
// integration cannot run in this workspace (its `sitemap` dependency rejects
// absolute Windows output paths). Single-page site: one canonical URL.
export default defineConfig({
  site: "https://renvel.studio",
  output: "static",
});
