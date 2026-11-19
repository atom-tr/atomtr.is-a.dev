# atomtr.dev

Personal site (Astro + Three.js + GSAP), static, deployed with Cloudflare Pages.

Design notes, the logo masters and the script that generates `src/assets/atomtr-*.svg` live in a **private** repo,
`atomtr-design`, normally checked out next to this one (`../atomtr-design`). Read its `DESIGN.md` first when
working on the look or the scroll story. Don't hand-edit `src/assets/atomtr-*.svg` (generated).

- Dev: `pnpm dev` (http://localhost:4321) · Build: `pnpm build`
- Skills for GSAP and Three.js live in `.agents/skills/` but are not committed (author's global gitignore).
  Reinstall: `npx skills add https://github.com/greensock/gsap-skills` and `npx skills add CloudAI-X/threejs-skills`
- No phone number on the site. Don't copy code from JIN2-ASCII (licence forbids reuse).
