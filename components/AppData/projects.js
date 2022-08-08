const PROJECTS_DATA = [
  {
    title: "Geogram",
    description: "A social network platform for travel.",
    about:
      "Geogram is a web application where users can share and view travel ideas and itenararies.",
    link: "https://www.geogramapp.com/",
    imageUrl: "https://devalparikh.me/img/geogram.png",
    github: "private",
    type: ["project", "fullstack"],
    technologies: ["React", "Javascript", "Java", "Spring", "MongoDB"],
  },
  {
    title: "HousingHelper",
    description: "A platform where users can find a roommate.",
    about:
      "A platform where users can find an alternative to corporate housing for internships and full-time positions out of town. This project was designed devloped using a multi-teired architecture to optimize reliability at higher scale.",
    link: "https://h-helper.herokuapp.com/",
    imageUrl: "https://devalparikh.me/img/HousingHelperGif.gif",
    github: "https://github.com/devalparikh/housinghelper",
    type: ["project", "fullstack"],
    technologies: ["React", "Javascript", "NodeJs", "MongoDB", "AWS"],
  },
  {
    title: "FlipFeed",
    description:
      "A platform where users can share property flips and renovations.",
    about:
      "A platform where users can share property flips and renovations. Developed a scalable full stack web application. This project was designed as a multi-teired architecture to optimize reliability at higher scale. System architecture includes Redis, NGINX Reverse Proxy, Caching, and Microservices.",
    link: "https://h-helper.herokuapp.com/",
    imageUrl: "https://devalparikh.me/img/flipfeed.png",
    github: "https://github.com/devalparikh/housinghelper",
    type: ["project", "fullstack"],
    technologies: ["React", "Javascript", "NodeJs", "MongoDB", "AWS"],
  },
  {
    title: "EyeBank",
    description:
      "Visually Impaired ATM - (University of Maryland) Bitcamp 2019.",
    about:
      "Created software for ATMs that allow users to have a conversation with an ATM, replacing the need for buttons (assisting visually impaired).",
    link: "https://devpost.com/software/eyebank",
    github: "private",
    imageUrl: "https://devalparikh.me/img/eyebank.png",
    type: ["project", "ml"],
    technologies: [
      "Python",
      "Machine Learning",
      "Neural Networks",
      "Darkflow CNN",
      "Google ML API",
      "Capital One Bank API",
    ],
    awards: [
      "1st Place Best Financial Software Hack - Capital One",
      "1st Place Bitcamp Compass Challenge",
    ],
  },
  {
    title: "Weapon Detection",
    description: "(Georgetown University) Hoya Hacks 2019.",
    about:
      "Built a software service to detect weapons in real-time camera footage using image classification with YOLO Convolution Neural Network architecture and created dashboards using AWS, Google Maps API, HTML, CSS, JavaScript.",
    link: "https://devpost.com/software/no-more-shootings-20",
    github: "private",
    imageUrl:
      "https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/000/753/970/datas/gallery.jpg",
    type: ["project", "ml"],
    technologies: [
      "Python",
      "Machine Learning",
      "Neural Networks",
      "Darkflow CNN",
      "AWS",
      "Google ML API",
    ],
    awards: [
      "1st Place Best Software Hack by Microsoft",
      "2nd place Amazon Web Services Hack",
      "3rd place Overall Georgetown University Hackathon",
    ],
  },
  {
    title: "NLPChatApp",
    description: "A chat app with ML NLP sentiment analysis and tone detection",
    about:
      "Entity detection / tone detection real time chat app using NLP and web sockets",
    github: "https://github.com/devalparikh/NLPChatApp",
    imageUrl: "https://miro.medium.com/max/1400/1*KmVHS7miXDwxMc1ZRMKXqQ.gif",
    type: ["project", "ml", "article"],
    technologies: [
      "Python",
      "Machine Learning",
      "NLP",
      "TensorFlow JS Deep Learning API",
      "IBM Cloud",
      "React",
      "NodeJS",
      "Web Sockets",
    ],
    article:
      "https://towardsdatascience.com/building-a-real-time-chat-application-with-nlp-super-powers-ce800e19cb2b",
  },
];

export default PROJECTS_DATA;
