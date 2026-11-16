import { defineConfig } from "astro/config";

// Static output only: plain files, any static host works.
export default defineConfig({
  site: "https://commandlinewizard.sh",
  output: "static",
  trailingSlash: "never",
  build: { format: "file" },
  devToolbar: { enabled: false },
});
