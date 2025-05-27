import { useEffect, useState } from "react";

interface DeveloperContent {
  name: string;
  title: string;
  about: string;
  education: {
    degree: string;
    institution: string;
    specialization: string;
  };
  skills: Array<{
    name: string;
    level: string;
    score: number;
    category: string;
  }>;
  experience: Array<{
    position: string;
    company: string;
    location: string;
    duration: string;
    description: string[];
    type: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    link: string;
    category: string;
    technologies?: string[];
    featured?: boolean;
  }>;
  achievements: Array<{
    title: string;
    organization: string;
    year: string;
    description: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    link: string;
    status: string;
    credentialId?: string;
  }>;
  testimonials: Array<{
    text: string;
    author: string;
    position: string;
    linkedin?: string;
  }>;
  contact: {
    email: string;
    linkedin: string;
    github: string;
    instagram: string;
    portfolio: string;
  };
}

interface UseFetchDeveloperContentReturn {
  content: DeveloperContent | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const useFetchDeveloperContent = (
  url: string
): UseFetchDeveloperContentReturn => {
  const [content, setContent] = useState<DeveloperContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseHTMLContent = (html: string): DeveloperContent => {
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Extract basic information
    const name = doc.querySelector("h1")?.textContent?.trim() || "Aditya";
    const title =
      doc.querySelector("h1 + p")?.textContent?.trim() ||
      "Cybersecurity Enthusiast | Web Developer | Lifelong Learner";

    // Extract about section
    const aboutSection = doc.querySelector('#about + div, [id*="about"] + div');
    const about =
      aboutSection?.querySelector("p")?.textContent?.trim() ||
      "Hi, I'm Aditya Kumar Tiwari, a passionate Cybersecurity Specialist and Full-Stack Developer. I thrive at the intersection of technology and innovation, crafting secure and scalable solutions for real-world challenges.";

    // Extract skills
    const skills = [
      { name: "Digital Forensics", level: "Advanced", score: 90 },
      { name: "HTML", level: "Advanced", score: 85 },
      { name: "Linux", level: "Advanced", score: 80 },
      { name: "CSS", level: "Intermediate", score: 70 },
      { name: "Python", level: "Intermediate", score: 65 },
      { name: "JavaScript", level: "Beginner", score: 50 },
      { name: "Firebase", level: "Beginner", score: 45 },
    ];

    // Extract experience
    const experience = [
      {
        position: "Cybersecurity and AI/ML Intern",
        company: "Quantam Pvt. Ltd.",
        duration: "Oct 2024 - Present",
        description:
          "Focused on hands-on projects in cybersecurity and AI/ML, applying theoretical knowledge to real-world challenges.",
      },
      {
        position: "Mentor (Part-time)",
        company: "JhaMobii Technologies Pvt. Ltd.",
        duration: "Aug 2024 - Present",
        description:
          "Provided technical mentorship in cybersecurity to junior professionals and interns.",
      },
      {
        position: "Cybersecurity Intern",
        company: "Null",
        duration: "Jun 2024 - Present",
        description:
          "Conducted vulnerability assessments and implemented robust network security protocols.",
      },
    ];

    // Extract projects
    const projects = [
      {
        name: "Movie Website (Cinesphere)",
        description:
          "A movie website developed to provide high-rated movies for free. Ideal for entertainment lovers.",
        link: "https://thecinesphere.netlify.app/",
      },
      {
        name: "Innova",
        description:
          "A modern, responsive e-commerce website designed for a seamless shopping experience.",
        link: "https://github.com/Xenonesis/Innova.git",
      },
      {
        name: "PropDekho",
        description:
          "A real estate website that helps users find and explore properties easily.",
        link: "https://github.com/Xenonesis/Propdekho.git",
      },
    ];

    // Extract achievements
    const achievements = [
      {
        title: "NSS Leader (President)",
        organization: "National Service Scheme",
        description:
          "Coordinated and led various community service initiatives, driving awareness on key social issues.",
      },
      {
        title: "University Sports Leader",
        organization: "Sushant University",
        description:
          "Led the university's sports teams, organizing and managing multiple events.",
      },
      {
        title: "Subhead at Gaming Nexus",
        organization: "Gaming Club",
        description:
          "Oversaw gaming tournaments and interactive workshops aimed at promoting esports on campus.",
      },
    ];

    // Extract certifications
    const certifications = [
      {
        name: "Foundations of Cybersecurity",
        issuer: "Google",
        date: "Aug 2024",
        link: "https://www.coursera.org/account/accomplishments/verify/IL7I0RLBABX3",
      },
      {
        name: "ISO 27001 Course",
        issuer: "AKITRA",
        date: "Nov 2024",
        link: "https://akitra.com/tutor-certificate/?cert_hash=39c932cf67346187",
      },
      {
        name: "Ethical Hacker",
        issuer: "Cisco",
        date: "Jul 2024",
        link: "https://www.credly.com/badges/302ac20c-baba-46d5-a3c5-0ff6b32d6072/linked_in_profile",
      },
    ];

    // Contact information
    const contact = {
      email: "itisaddy7@gmail.com",
      linkedin: "https://www.linkedin.com/in/itisaddy/",
      github: "https://github.com/Xenonesis",
      instagram: "https://www.instagram.com/i__aditya7/",
    };

    return {
      name,
      title,
      about,
      skills,
      experience,
      projects,
      achievements,
      certifications,
      contact,
    };
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use static content (CORS restrictions prevent external fetch)
      console.log("Loading developer content...");

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setContent({
        name: "Aditya Kumar Tiwari",
        title: "Cybersecurity Enthusiast | Web Developer | Lifelong Learner",
        about:
          "Hi, I'm Aditya Kumar Tiwari, a passionate Cybersecurity Specialist and Full-Stack Developer. I thrive at the intersection of technology and innovation, crafting secure and scalable solutions for real-world challenges. Currently pursuing a BCA in Cybersecurity at Sushant University, I specialize in Python, JavaScript, Linux, and Cloud Computing. My mission is to combine security and creativity to build impactful digital experiences.",
        education: {
          degree: "BCA (Bachelor of Computer Applications)",
          institution: "Sushant University",
          specialization: "Cybersecurity",
        },
        skills: [
          {
            name: "Digital Forensics",
            level: "Advanced",
            score: 90,
            category: "Security",
          },
          { name: "HTML", level: "Advanced", score: 85, category: "Frontend" },
          { name: "Linux", level: "Advanced", score: 80, category: "Systems" },
          {
            name: "CSS",
            level: "Intermediate",
            score: 70,
            category: "Frontend",
          },
          {
            name: "Python",
            level: "Intermediate",
            score: 65,
            category: "Programming",
          },
          {
            name: "JavaScript",
            level: "Beginner",
            score: 50,
            category: "Programming",
          },
          {
            name: "Firebase",
            level: "Beginner",
            score: 45,
            category: "Backend",
          },
        ],
        experience: [
          {
            position: "Cybersecurity and AI/ML Intern",
            company: "Quantam Pvt. Ltd.",
            location: "Gurugram, Haryana",
            duration: "Oct 2024 - Present",
            type: "Internship",
            description: [
              "Focused on hands-on projects in cybersecurity and AI/ML, applying theoretical knowledge to real-world challenges.",
              "Collaborated with the Counseling Team and worked under the guidance of a dedicated mentor.",
              "Enhanced understanding of cybersecurity protocols, AI/ML applications, confidentiality, and data protection.",
              "Gained insights into corporate ethics and best practices for data security in a professional environment.",
            ],
          },
          {
            position: "Mentor (Part-time)",
            company: "JhaMobii Technologies Pvt. Ltd.",
            location: "Remote",
            duration: "Aug 2024 - Present",
            type: "Part-time",
            description: [
              "Provided technical mentorship in cybersecurity to junior professionals and interns.",
              "Guided team members through vulnerability assessments, threat analysis, and incident response strategies.",
              "Supported learners in mastering security frameworks, cloud security, and penetration testing.",
              "Ensured mentees understood best practices for securing networks and applications in real-world environments.",
            ],
          },
          {
            position: "Cybersecurity Intern",
            company: "Null",
            location: "Remote",
            duration: "Jun 2024 - Present",
            type: "Internship",
            description: [
              "Conducted vulnerability assessments and implemented robust network security protocols.",
              "Monitored network traffic and responded to security incidents with a focus on intrusion detection.",
              "Worked with remote teams to secure client systems, ensuring compliance with industry standards.",
              "Gained hands-on experience with SIEM tools, firewall configurations, and incident response strategies.",
            ],
          },
        ],
        projects: [
          {
            name: "Movie Website (Cinesphere)",
            description:
              "A movie website developed to provide high-rated movies for free. Ideal for entertainment lovers.",
            link: "https://thecinesphere.netlify.app/",
            category: "Web Development",
            technologies: ["HTML", "CSS", "JavaScript"],
            featured: true,
          },
          {
            name: "Innova",
            description:
              "A modern, responsive e-commerce website designed for a seamless shopping experience. Great for e-commerce enthusiasts.",
            link: "https://github.com/Xenonesis/Innova.git",
            category: "E-commerce",
            technologies: ["HTML", "CSS", "JavaScript"],
            featured: true,
          },
          {
            name: "PropDekho",
            description:
              "A real estate website that helps users find and explore properties easily. Ideal for those interested in real estate or property search.",
            link: "https://github.com/Xenonesis/Propdekho.git",
            category: "Real Estate",
            technologies: ["HTML", "CSS", "JavaScript"],
            featured: true,
          },
          {
            name: "Real Estate Chatbot",
            description:
              "A chatbot developed for real estate inquiries, offering users assistance in finding properties. Ideal for chatbot development enthusiasts.",
            link: "https://github.com/Xenonesis/Real-state-BOT.git",
            category: "AI/Chatbot",
            technologies: ["Python", "AI/ML"],
          },
          {
            name: "Flappy Bird Game",
            description:
              "A 2D game built using HTML, CSS, and JavaScript. A fun project for game enthusiasts.",
            link: "https://github.com/Xenonesis/NS-Flappy-Bird.git",
            category: "Game Development",
            technologies: ["HTML", "CSS", "JavaScript"],
          },
          {
            name: "Typing Master",
            description:
              "A comprehensive typing speed and accuracy training application designed to improve typing skills through interactive exercises and real-time feedback.",
            link: "https://github.com/Xenonesis/typingmaster",
            category: "Web Development",
            technologies: ["JavaScript", "HTML", "CSS"],
          },
          {
            name: "SEO Optimized Website",
            description:
              "An SEO-optimized website to improve search engine visibility using best practices. Perfect for SEO and digital marketing enthusiasts.",
            link: "https://github.com/Xenonesis/SEO-Website.git",
            category: "SEO/Marketing",
            technologies: ["HTML", "CSS", "SEO"],
          },
          {
            name: "Juris.AI",
            description:
              "An AI-powered legal assistant platform that provides intelligent legal research, document analysis, and case management solutions for legal professionals.",
            link: "https://github.com/Xenonesis/Juris.AI",
            category: "AI/Legal Tech",
            technologies: ["AI/ML", "Python", "Legal Tech"],
            featured: true,
          },
          {
            name: "Budget Tracker",
            description:
              "A comprehensive personal finance management application for tracking expenses, managing budgets, and analyzing spending patterns with intuitive visualizations.",
            link: "https://github.com/Xenonesis/Budget-Tracker-",
            category: "Finance/Productivity",
            technologies: ["JavaScript", "Data Visualization", "Finance"],
          },
          {
            name: "SwiftDrop",
            description:
              "A fast and secure file sharing platform that enables easy drag-and-drop file transfers with real-time sharing capabilities and user-friendly interface.",
            link: "https://github.com/Xenonesis/file-drop-easy",
            category: "File Management",
            technologies: ["JavaScript", "File Transfer", "Web APIs"],
          },
        ],
        achievements: [
          {
            title: "NSS Leader (President)",
            organization: "National Service Scheme",
            year: "2023 - Present",
            description: [
              "Coordinated and led various community service initiatives, driving awareness on key social issues.",
              "Managed a team of 120+ volunteers, organizing events and workshops focusing on health and education.",
            ],
          },
          {
            title: "University Sports Leader",
            organization: "Sushant University",
            year: "2023 - 2024",
            description: [
              "Led the university's sports teams, organizing and managing multiple events that increased student participation by 30%.",
              "Spearheaded inter-university competitions, securing top positions in regional tournaments.",
            ],
          },
          {
            title: "Subhead at Gaming Nexus (Gaming Club)",
            organization: "Gaming Nexus",
            year: "2023 - Present",
            description: [
              "Oversaw gaming tournaments and interactive workshops aimed at promoting esports on campus.",
              "Facilitated strategic partnerships with external gaming sponsors, leading to a 50% increase in club funding.",
              "Mentored new members in strategy-based games, focusing on team-building and competitive gaming skills.",
            ],
          },
        ],
        certifications: [
          {
            name: "Foundations of Cybersecurity",
            issuer: "Google",
            date: "Aug 2024",
            status: "Completed",
            link: "https://www.coursera.org/account/accomplishments/verify/IL7I0RLBABX3",
          },
          {
            name: "ISO 27001 Course",
            issuer: "AKITRA",
            date: "Nov 2024",
            status: "Completed",
            link: "https://akitra.com/tutor-certificate/?cert_hash=39c932cf67346187",
          },
          {
            name: "Ethical Hacker",
            issuer: "Cisco",
            date: "Jul 2024",
            status: "Completed",
            link: "https://www.credly.com/badges/302ac20c-baba-46d5-a3c5-0ff6b32d6072/linked_in_profile",
          },
          {
            name: "Introduction to Cybersecurity",
            issuer: "Cisco",
            date: "Jul 2024",
            status: "Completed",
            link: "https://www.credly.com/badges/f6e3d7cb-b6bf-401f-b87a-447cca3abbcc/linked_in_profile",
          },
          {
            name: "Endpoint Security",
            issuer: "Cisco",
            date: "Jul 2024",
            status: "Completed",
            link: "https://www.credly.com/badges/47017e02-d9b2-45e3-bf63-732d622fcb66/linked_in_profile",
          },
          {
            name: "Network Support and Security",
            issuer: "Cisco",
            date: "Jul 2024",
            status: "Completed",
            link: "https://www.credly.com/badges/fa483dac-72a2-41b4-93a0-07612bdab2d2/linked_in_profile",
          },
          {
            name: "Cisco Cyber Threat Management",
            issuer: "CISCO",
            date: "Jul 2024",
            status: "In Progress",
            link: "https://www.credly.com/badges/1207700f-4d5d-4abb-a474-811a6d1eff23/linked_in_profile",
          },
          {
            name: "Technical Support Fundamental",
            issuer: "Google",
            date: "Jul 2024",
            status: "Completed",
            link: "https://www.coursera.org/account/accomplishments/verify/6RWVRXZAWC7K",
          },
          {
            name: "Cybersecurity for Everyone",
            issuer: "University of Maryland, College Park",
            date: "Jul 2024",
            status: "Completed",
            link: "https://www.coursera.org/account/accomplishments/verify/N66VEGBQ6V4U",
          },
          {
            name: "Introduction to Prompt Engineering for Generative AI",
            issuer: "LinkedIn",
            date: "Jul 2024",
            status: "Completed",
            link: "https://www.linkedin.com/learning/certificates/71de56a2fe68bd1be82dd6a5d850fa6b1f5115d360826695dcc0d754ae2114b2",
          },
        ],
        testimonials: [
          {
            text: "Aditya is a stellar student and proficient future technology professional..he has all the qualities to become an influential leader and a professional game changer... he is actively able to perform the most daunting tasks with enormous ease....as a mentor it is a privilege to impart professional skills to this stupendous future leader and top performer.... 11 on 10 to Aditya...keep rocking and kick ass..👍👍👍",
            author: "Siddharth Anand",
            position: "Aditya's Teacher",
            linkedin: "https://www.linkedin.com/in/siddhartth-anand-b175011b/",
          },
          {
            text: "Aditya exemplifies resilience, curiosity, and purpose-driven learning. With a rare blend of humility and leadership, he turns challenges into opportunities for growth, inspiring those around him. A lifelong learner, Aditya is destined to make a meaningful impact, reminding us that true success is built with purpose, Practice and heart...",
            author: "Prateek Yadav",
            position: "Aditya's Teacher",
            linkedin: "https://www.linkedin.com/in/pratik-yadav-1a769b90/",
          },
          {
            text: "Aditya's dedication and passion for learning is truly inspiring. He is always eager to tackle new challenges with enthusiasm and determination...",
            author: "Rahul Sharma",
            position: "Mentor",
          },
          {
            text: "A great leader and problem solver. Aditya's skills in technology and cybersecurity are top-notch, making him a valuable asset to any team...",
            author: "Anonymous Colleague",
            position: "Team Member",
          },
        ],
        contact: {
          email: "itisaddy7@gmail.com",
          linkedin: "https://www.linkedin.com/in/itisaddy/",
          github: "https://github.com/Xenonesis",
          instagram: "https://www.instagram.com/i__aditya7/",
          portfolio: "https://iaddy.netlify.app/",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [url]);

  const retry = () => {
    fetchContent();
  };

  return { content, loading, error, retry };
};

export default useFetchDeveloperContent;
