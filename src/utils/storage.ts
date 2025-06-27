import { Project } from '../types';
import { generateUniqueId } from './parser';

const STORAGE_KEY = 'algoflow_projects';

export function saveProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
  const projects = loadProjects();
  
  const newProject: Project = {
    ...project,
    id: generateUniqueId(),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  
  return newProject;
}

export function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null {
  const projects = loadProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: Date.now()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return projects[index];
}

export function loadProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function loadProject(id: string): Project | null {
  const projects = loadProjects();
  return projects.find(p => p.id === id) || null;
}

export function deleteProject(id: string): boolean {
  const projects = loadProjects();
  const filtered = projects.filter(p => p.id !== id);
  
  if (filtered.length === projects.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}