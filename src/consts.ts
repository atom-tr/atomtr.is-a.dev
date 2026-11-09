import type { SvgComponent } from "astro/types"
import Email from "@/assets/icons/email.svg"
import GitHub from "@/assets/icons/github.svg"
import Globe from "@/assets/icons/globe.svg"

export const SITE = {
  title: "atomtr",
  description:
    "Thai Tran - DevOps Engineer personal archive, notes & projects.",
  locale: "en-US",
  dir: "ltr",
  defaultPageImage: "/static/opengraph-image.png",
  defaultPostImage: "/static/1200x630.png",
} as const

export const NAVIGATION = [
  { href: "/archive", label: "Archive" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
]

export const SOCIALS: { href: string; label: string; icon: SvgComponent }[] = [
  { href: "https://github.com/atom-tr", label: "GitHub", icon: GitHub },
  { href: "mailto:thai.tr@hotmail.com", label: "Email", icon: Email },
  { href: "https://atomtr.link", label: "Website", icon: Globe },
]
