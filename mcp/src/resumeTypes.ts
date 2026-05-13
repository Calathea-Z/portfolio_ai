/** Mirrors `api/Portfolio.Api/Models/ResumeData.cs` for parsing `resume.json`. */

export type ResumePerson = {
  name?: string;
  summary?: string;
  location?: string;
  remote?: boolean;
  timeZone?: string | null;
  email?: string;
  portfolioSite?: string | null;
  github?: string;
  linkedin?: string;
  freelanceSite?: string;
  workAuth?: string | null;
  availability?: string | null;
  employmentTypes?: string[];
  compensation?: string | null;
  lookingFor?: string;
};

export type ResumeNarrative = {
  originStory?: string;
  bridge?: string;
  carryover?: string;
};

export type ResumeRole = {
  id: string;
  title?: string;
  org?: string;
  startYear: number;
  startMonth?: number | null;
  endYear?: number | null;
  endMonth?: number | null;
  remote?: boolean;
  url?: string | null;
  summary?: string;
  achievements?: string[];
  tech?: string[];
};

export type ResumeProject = {
  id: string;
  name?: string;
  roleId?: string | null;
  year: number;
  status?: string;
  visibility?: string | null;
  url?: string | null;
  repoUrl?: string | null;
  demoUrl?: string | null;
  summary?: string;
  outcomes?: string[];
  tech?: string[];
};

export type ResumeMetric = {
  id: string;
  label?: string;
  value: number;
  unit?: string;
  note?: string | null;
};

export type ResumeFaqEntry = {
  id: string;
  question?: string;
  answer?: string;
};

export type ResumeData = {
  person?: ResumePerson;
  narrative?: ResumeNarrative;
  roles?: ResumeRole[];
  projects?: ResumeProject[];
  metrics?: ResumeMetric[];
  faq?: ResumeFaqEntry[];
};
