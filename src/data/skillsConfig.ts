export interface SkillConfig {
  name: string;
  level: string;
  score: number;
  category: string;
  logoColor: string;
  logoShape: 'cube' | 'sphere' | 'cylinder' | 'torus' | 'octahedron';
  description?: string;
}

export const enhancedSkills: SkillConfig[] = [
  // Frontend Technologies
  {
    name: 'React',
    level: 'Advanced',
    score: 92,
    category: 'Frontend',
    logoColor: '#61DAFB',
    logoShape: 'sphere',
    description: 'Modern React with hooks, context, and performance optimization'
  },
  {
    name: 'Next.js',
    level: 'Advanced',
    score: 90,
    category: 'Frontend',
    logoColor: '#000000',
    logoShape: 'cube',
    description: 'Full-stack React framework with SSR and API routes'
  },
  {
    name: 'Tailwind CSS',
    level: 'Advanced',
    score: 95,
    category: 'Frontend',
    logoColor: '#06B6D4',
    logoShape: 'torus',
    description: 'Utility-first CSS framework for rapid UI development'
  },
  {
    name: 'TypeScript',
    level: 'Intermediate',
    score: 78,
    category: 'Language',
    logoColor: '#3178C6',
    logoShape: 'octahedron',
    description: 'Strongly typed JavaScript for better development experience'
  },
  
  // Backend & Languages
  {
    name: 'JavaScript',
    level: 'Advanced',
    score: 88,
    category: 'Language',
    logoColor: '#F7DF1E',
    logoShape: 'cube',
    description: 'Modern ES6+ JavaScript with async/await and modules'
  },
  {
    name: 'Python',
    level: 'Advanced',
    score: 85,
    category: 'Language',
    logoColor: '#3776AB',
    logoShape: 'cylinder',
    description: 'Backend development, automation, and data analysis'
  },
  {
    name: 'Node.js',
    level: 'Intermediate',
    score: 75,
    category: 'Backend',
    logoColor: '#339933',
    logoShape: 'sphere',
    description: 'Server-side JavaScript runtime for scalable applications'
  },
  
  // Databases & Tools
  {
    name: 'MongoDB',
    level: 'Intermediate',
    score: 72,
    category: 'Database',
    logoColor: '#47A248',
    logoShape: 'torus',
    description: 'NoSQL database for flexible data storage'
  },
  {
    name: 'Git',
    level: 'Advanced',
    score: 90,
    category: 'Tools',
    logoColor: '#F05032',
    logoShape: 'octahedron',
    description: 'Version control and collaborative development'
  },
  
  // Cybersecurity
  {
    name: 'Cybersecurity',
    level: 'Advanced',
    score: 87,
    category: 'Security',
    logoColor: '#FF6B6B',
    logoShape: 'cube',
    description: 'Network security, penetration testing, and threat analysis'
  },
  {
    name: 'Ethical Hacking',
    level: 'Intermediate',
    score: 80,
    category: 'Security',
    logoColor: '#4ECDC4',
    logoShape: 'cylinder',
    description: 'Penetration testing and vulnerability assessment'
  },
  
  // Cloud & DevOps
  {
    name: 'AWS',
    level: 'Intermediate',
    score: 70,
    category: 'Cloud',
    logoColor: '#FF9900',
    logoShape: 'sphere',
    description: 'Cloud infrastructure and serverless applications'
  }
];

export const getSkillsByCategory = () => {
  const categories: Record<string, SkillConfig[]> = {};
  
  enhancedSkills.forEach(skill => {
    if (!categories[skill.category]) {
      categories[skill.category] = [];
    }
    categories[skill.category].push(skill);
  });
  
  return categories;
};

export const getSkillByName = (name: string): SkillConfig | undefined => {
  return enhancedSkills.find(skill => skill.name.toLowerCase() === name.toLowerCase());
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Frontend': '#3B82F6',
    'Backend': '#10B981',
    'Language': '#8B5CF6',
    'Database': '#F59E0B',
    'Tools': '#EF4444',
    'Security': '#EC4899',
    'Cloud': '#06B6D4',
  };
  
  return colors[category] || '#6B7280';
};

export const getSkillLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    'Beginner': '#10B981',
    'Intermediate': '#F59E0B',
    'Advanced': '#EF4444',
    'Expert': '#8B5CF6',
  };
  
  return colors[level] || '#6B7280';
};

export const getSkillScoreColor = (score: number): string => {
  if (score >= 90) return '#10B981'; // Green
  if (score >= 75) return '#F59E0B'; // Yellow
  if (score >= 60) return '#EF4444'; // Red
  return '#6B7280'; // Gray
};
