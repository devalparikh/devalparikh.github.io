export const site = {
  name: "Deval Parikh",
  shortName: "Deval",
  url: "https://devalparikh.me",
  role: "Senior Software Engineer at Microsoft Azure",
  tagline:
    "Software engineer with interests in large scale distributed systems and artificial intelligence.",
  blurb:
    "Currently building systems to scale secure supercomputing workloads at Microsoft Azure.",
  portrait: {
    src: "https://avatars.githubusercontent.com/u/13604973?v=4",
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
  external: boolean;
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
    value: "DevalParikhResume.pdf",
    href: site.resume,
    external: true,
  },
];
