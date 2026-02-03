export interface Experience {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string; // ISO Date or YYYY-MM
    endDate?: string; // ISO Date or YYYY-MM, null if current
    current: boolean;
    description: string;
}

export interface Education {
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
}

export interface Skill {
    id: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Language {
    id: string;
    name: string;
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native';
}

export interface CV {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
    experiences: Experience[];
    education: Education[];
    skills: Skill[];
    languages: Language[];
    hobbies?: string[];
    portfolioUrl?: string;
    linkedinUrl?: string;
    updatedAt: string;
}
