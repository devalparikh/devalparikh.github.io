export const site = {
  name: "Deval Parikh",
  shortName: "Deval",
  url: "https://devalparikh.me",
  role: "Staff Software Engineer @ Microsoft Azure",
  tagline:
    "Hi, I'm Deval 👋. I work on planet-scale distributed systems and AI/ML at scale.",
  blurb:
    "Building systems to scale secure supercomputing workloads at Microsoft Azure.",
  portrait: {
    src: "/img/portrait.webp",
    alt: "Deval Parikh",
    caption: "Deval Parikh",
  },
  email: "devalpp@gmail.com",
  resume: "/DevalParikhResume.pdf",
} as const;

export interface SocialLink {
  id: string;
  label: string;
  /** Shown next to the label on the contact page. */
  value: string;
  href: string;
  /** Off-site, so the label gets an arrow. */
  external: boolean;
  /** Opens in a new tab even though it is an in-site route. */
  newTab?: boolean;
}

export const socials: SocialLink[] = [
  {
    id: "github",
    label: "GitHub",
    value: "github.com/devalparikh",
    href: "https://github.com/devalparikh",
    external: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/devalparikh1",
    href: "https://www.linkedin.com/in/devalparikh1/",
    external: true,
  },
  {
    id: "email",
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    external: false,
  },
  {
    id: "resume",
    label: "Resume",
    value: "devalparikh.me/resume",
    href: "/resume/",
    external: false,
    newTab: true,
  },
];
