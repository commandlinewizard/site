import { getCollection } from "astro:content";

/**
 * The spells that exist on the public site: only released episodes (`published: true`).
 * `CW_DRAFTS=1` includes the unreleased ones,
 * so drafts can be previewed and screenshotted without ever being deployed.
 */
export const showDrafts = process.env.CW_DRAFTS === "1";

export async function releasedSpells() {
  const all = await getCollection("spells");
  return all
    .filter((s) => s.data.published || showDrafts)
    .sort((a, b) => a.data.episode - b.data.episode);
}
