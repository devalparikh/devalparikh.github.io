import { ALL_FILTER, type Collection } from "./types";

export const projects: Collection = {
  id: "projects",
  title: "Projects",
  description: "Things I've designed, built, and shipped.",
  filters: [
    ALL_FILTER,
    { id: "fullstack", label: "Full Stack" },
    { id: "ml", label: "Machine Learning" },
  ],
  entries: [
    {
      id: "rolodex",
      title: "Rolodex",
      meta: "rolodex.dev",
      summary: "AI-powered talent discovery platform for organizations.",
      categories: ["fullstack", "ml"],
      href: "https://rolodex.dev/",
      sections: [
        {
          heading: "About",
          body: "Rolodex helps organizations quickly identify and assemble the right team members by analyzing employees' actual work contributions to create digital twins and match people based on real expertise rather than job titles.",
        },
      ],
      tags: ["AI", "Machine Learning", "Embeddings", "Semantic Analysis"],
      links: [{ label: "rolodex.dev", href: "https://rolodex.dev/" }],
    },
    {
      id: "geogram",
      title: "Geogram",
      meta: "geogramapp.com",
      summary: "A social network platform for travel.",
      categories: ["fullstack"],
      href: "https://www.geogramapp.com/",
      image: "/img/geogram.webp",
      sections: [
        {
          heading: "About",
          body: "Geogram is a web application where users can share and view travel ideas and itenararies.",
        },
      ],
      tags: ["React", "Javascript", "Java", "Spring", "MongoDB"],
      links: [{ label: "geogramapp.com", href: "https://www.geogramapp.com/" }],
    },
    {
      id: "housinghelper",
      title: "HousingHelper",
      summary: "A platform where users can find a roommate.",
      categories: ["fullstack"],
      href: "https://github.com/devalparikh/housinghelper",
      image: "/img/housinghelper.webp",
      sections: [
        {
          heading: "About",
          body: "A platform where users can find an alternative to corporate housing for internships and full-time positions out of town. This project was designed devloped using a multi-teired architecture to optimize reliability at higher scale.",
        },
      ],
      tags: ["React", "Javascript", "NodeJs", "MongoDB", "AWS"],
      links: [
        { label: "GitHub", href: "https://github.com/devalparikh/housinghelper" },
      ],
    },
    {
      id: "flipfeed",
      title: "FlipFeed",
      summary: "A platform where users can share property flips and renovations.",
      categories: ["fullstack"],
      href: "https://github.com/devalparikh/housinghelper",
      image: "/img/flipfeed.webp",
      sections: [
        {
          heading: "About",
          body: "A platform where users can share property flips and renovations. Developed a scalable full stack web application. This project was designed as a multi-teired architecture to optimize reliability at higher scale. System architecture includes Redis, NGINX Reverse Proxy, Caching, and Microservices.",
        },
      ],
      tags: ["React", "Javascript", "NodeJs", "MongoDB", "AWS"],
      links: [
        { label: "GitHub", href: "https://github.com/devalparikh/housinghelper" },
      ],
    },
    {
      id: "eyebank",
      title: "EyeBank",
      meta: "2019",
      summary: "Visually Impaired ATM — Bitcamp 2019, University of Maryland.",
      categories: ["ml"],
      href: "https://devpost.com/software/eyebank",
      image: "/img/eyebank.webp",
      sections: [
        {
          heading: "About",
          body: "Created software for ATMs that allow users to have a conversation with an ATM, replacing the need for buttons (assisting visually impaired).",
        },
        {
          heading: "Awards",
          bullets: [
            "1st Place Best Financial Software Hack — Capital One",
            "1st Place Bitcamp Compass Challenge",
          ],
        },
      ],
      tags: [
        "Python",
        "Machine Learning",
        "Neural Networks",
        "Darkflow CNN",
        "Google ML API",
        "Capital One Bank API",
      ],
      links: [{ label: "Devpost", href: "https://devpost.com/software/eyebank" }],
    },
    {
      id: "weapon-detection",
      title: "Weapon Detection",
      meta: "2019",
      summary: "Real-time weapon detection in camera footage.",
      categories: ["ml"],
      href: "https://devpost.com/software/no-more-shootings-20",
      sections: [
        {
          heading: "About",
          body: "Built a software service to detect weapons in real-time camera footage using image classification with YOLO Convolution Neural Network architecture and created dashboards using AWS, Google Maps API, HTML, CSS, JavaScript.",
        },
        {
          heading: "Awards",
          bullets: [
            "1st Place Best Software Hack by Microsoft",
            "2nd Place Amazon Web Services Hack",
            "3rd Place Overall Georgetown University Hackathon",
          ],
        },
      ],
      tags: [
        "Python",
        "Machine Learning",
        "Neural Networks",
        "Darkflow CNN",
        "AWS",
        "Google ML API",
      ],
      links: [
        { label: "Devpost", href: "https://devpost.com/software/no-more-shootings-20" },
      ],
    },
    {
      id: "nlp-chat-app",
      title: "NLPChatApp",
      summary: "Entity and tone detection in a real time chat app.",
      categories: ["ml", "fullstack"],
      href: "https://github.com/devalparikh/NLPChatApp",
      sections: [
        {
          heading: "About",
          body: "Entity detection / tone detection real time chat app using NLP and web sockets.",
        },
      ],
      tags: [
        "Python",
        "Machine Learning",
        "NLP",
        "TensorFlow JS Deep Learning API",
        "IBM Cloud",
        "React",
        "NodeJS",
        "Web Sockets",
      ],
      links: [
        { label: "GitHub", href: "https://github.com/devalparikh/NLPChatApp" },
        {
          label: "Write-up",
          href: "https://towardsdatascience.com/building-a-real-time-chat-application-with-nlp-super-powers-ce800e19cb2b",
        },
      ],
    },
  ],
};
