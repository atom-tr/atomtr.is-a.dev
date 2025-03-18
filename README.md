![Showcase Card](/public/static/twitter-card.png)

<div align="center">

## atomtr.is-a.dev

![Stargazers]
[![License]](LICENSE)

</div>

atomtr.is-a.dev is an opinionated, no-frills static blogging template built with [Astro](https://astro.build/), [Tailwind](https://tailwindcss.com/), and [shadcn/ui](https://ui.shadcn.com/). Extraordinarily loosely based off the [Astro Micro](https://astro-micro.vercel.app/) theme by [trevortylerlee](https://github.com/trevortylerlee).

---

## Features

- [Astro](https://astro.build/)&rsquo;s [Islands](https://docs.astro.build/en/concepts/islands/) architecture for partial/selective hydration and client-side interactivity while maintaining a fast-to-render static site.
- [shadcn/ui](https://ui.shadcn.com/)&rsquo;s [Tailwind](https://tailwindcss.com/) color convention for automatic styling across both light and dark themes. Includes accessible, theme-aware UI components for navigation, buttons, etc.
- [rehype-pretty-code](https://rehype-pretty.pages.dev/) with [Shiki](https://github.com/shikijs/shiki) for advanced code block styling, highlighting, and code block titles/captions.
- Blog post authoring using [MDX](https://mdxjs.com/) for component-style content, alongside $\LaTeX$ rendering using [KaTeX](https://katex.org/).
- Astro [View Transitions](https://docs.astro.build/en/guides/view-transitions/) in <abbr title="Single Page Application">SPA</abbr> mode for smooth, opt-in animations during route switching.
- SEO optimization with fine-grained control over metadata and [Open Graph](https://ogp.me/) tags for each post.
- [RSS](https://en.wikipedia.org/wiki/RSS) feeds and sitemap generation!
- [Pagefind](https://pagefind.app/) integration for fast and efficient full-text search capabilities across the site.🆕
- [Giscus](https://giscus.app/) integration for a lightweight, open-source commenting system that leverages GitHub Discussions.🆕
- Supports author profiles (with a dedicated authors page) and adding multiple authors per post.
- Supports project tags (with a dedicated tags page) for easy post categorization and discovery.

## Technology Stack

This is a list of the various technologies used to build this template:

| Category            | Technology Name                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| Framework           | [Astro](https://astro.build/)                                                                      |
| Styling             | [Tailwind](https://tailwindcss.com)                                                                |
| Components          | [shadcn/ui](https://ui.shadcn.com/)                                                                |
| Content             | [MDX](https://mdxjs.com/)                                                                          |
| Syntax Highlighting | [Shiki](https://github.com/shikijs/shiki) + [rehype-pretty-code](https://rehype-pretty.pages.dev/) |
| Graphics            | [Figma](https://www.figma.com/)                                                                    |
| Deployment          | [Cloudflare](https://www.cloudflare.com/)                                                          |

---

## Licensing

This project uses a multi-tiered licensing approach to differentiate between various components:

### Original Template

From the [Original Template License](LICENSE.md#original-template-license) section within the license:

> This website is based on [astro-erudite](https://github.com/jktrn/astro-erudite), which was loosely derived from an MIT-licensed project, [trevortylerlee/astro-micro](https://github.com/trevortylerlee/astro-micro).

The original MIT license is included in the full [LICENSE.md](LICENSE.md) file for compliance.

### Website Code

[![Code License]](LICENSE.md)

All modifications and custom implementations made to the original template are proprietary and all rights are reserved. The code is publicly available for viewing and reference only. Modification, redistribution, or commercial use requires explicit permission from the copyright holder.

From the [Website Code License](LICENSE.md#website-code-license) section:

> This license applies specifically to the custom modifications made to the [jktrn/astro-erudite](https://github.com/jktrn/astro-erudite) template. It does not extend to the original template code, which remains under its original MIT license.

From the [Disclaimer](LICENSE.md#disclaimer) section:

> If you are interested in utilizing a similar website structure for your own means, please refer to the original template at [jktrn/astro-erudite](https://github.com/jktrn/astro-erudite), which is available under the MIT license and is free for use and modification.