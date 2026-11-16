# Command Line Wizard: the site

Source of [commandlinewizard.sh](https://commandlinewizard.sh): one cheat sheet per episode of
*Command Line Wizard*, one terminal tool in 2 minutes
([YouTube](https://www.youtube.com/@CommandLineWizard)).

Static [Astro](https://astro.build) site. Cheat sheets live in `src/content/spells/`, one
Markdown file per tool; a page appears once its episode is released.

```sh
npm ci
npm run dev      # http://localhost:4321
npm run build    # static files in dist/
```

Spotted a wrong option or a broken recipe? Issues and pull requests are welcome.

## License

MIT (see `LICENSE`), code and cheat sheets alike. The JetBrains Mono fonts in `public/fonts/`
are under the SIL Open Font License (`public/fonts/OFL.txt`).
