import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// One Markdown file per episode ("spell"). The frontmatter holds the structured
// cheat sheet; the Markdown body is the short "what is it" intro.
const run = z.object({
  cmd: z.string(),
  out: z.string().optional(),
});

const spells = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/spells" }),
  schema: z.object({
    tool: z.string(),
    episode: z.number(),
    tagline: z.string(),
    description: z.string(),
    version: z.string(),
    pillar: z.enum(["Ancient Spells", "Spell Upgrades", "Enchanted Interfaces", "Wizard's Tower"]),
    youtubeId: z.string().optional(),
    published: z.boolean().default(false),
    // "keys" for TUIs: the options and the full table are key bindings, not CLI flags
    optionsKind: z.enum(["flags", "keys"]).default("flags"),
    install: z.array(z.object({ via: z.string(), cmd: z.string() })),
    hero: run,
    options: z.array(z.object({ flag: z.string(), what: z.string(), example: z.string() })),
    recipes: z.array(run.extend({ task: z.string() })),
    gotcha: z.object({
      title: z.string(),
      wrong: run,
      right: run,
      why: z.string(),
    }),
    allOptions: z.array(z.object({ flag: z.string(), desc: z.string() })),
    allOptionsSource: z.string(),
    pairsWith: z.array(z.object({ tool: z.string(), why: z.string() })),
    eggs: z.array(z.string()),
    // the wizard's deadpan line in "the trap" (≤ 8 words), e.g. trap: "Single quotes. I'll wait."
    wizardSays: z.object({ trap: z.string().optional() }).optional(),
  }),
});

export const collections = { spells };
